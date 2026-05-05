const { createClient } = require("redis");
const ClienteRepository = require("@modules/cliente/domain/repository/cliente.repository");
const Cliente = require("@modules/cliente/domain/entities/cliente");
const logger = require("@common/logger");

let connectionPromise = null;

class ClienteRedisRepository extends ClienteRepository {

  constructor() {
    super();
    this.client = createClient({
      url: process.env.REDIS_URL || "redis://localhost:6379",
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 3) {
            return new Error("Redis no disponible");
          }
          return 500; // reintenta cada 500ms
        }
      }
    });
    
    // Eventos importantes
    this.client.on("error", (err) => {
      logger.error("Redis error", {
        layer: "infrastructure",
        repository: "ClienteRedisRepository",
        error: err.message
      });
    });

    this.client.on("end", () => {
      logger.warn("Redis conexión cerrada", {
        layer: "infrastructure",
        repository: "ClienteRedisRepository"
      });
    });

    this.client.on("reconnecting", () => {
      logger.warn("Redis reconectando...", {
        layer: "infrastructure",
        repository: "ClienteRedisRepository"
      });
    });
  }

  async ensureConnection() {
    if (this.client.isOpen) return;  // Evitar reconectar si ya está conectado (propio de Redis v4)

    if (!connectionPromise) { // Evita múltiples conexiones concurrentes, Solo la primera request crea la conexión. Las demás esperan la misma promesa (N requests al mismo tiempo pueden intentar conectar) 
      
      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Redis connection timeout")), 2000)
      );

      connectionPromise = Promise.race([
        this.client.connect(),
        timeout
      ]);
    }

    try {
      await connectionPromise;  // Todas las requests esperan aquí hasta que la conexión se establezca o falle

      logger.info("Redis conectado", {
        layer: "infrastructure",
        repository: "ClienteRedisRepository"
      });

    } catch (error) {
      logger.error("Error conectando a Redis", {
        error: error.message
      });
      throw error;

    } finally {
      connectionPromise = null; // Reiniciar la promesa para futuros intentos de conexión si falla
    }
  }

  async listar() {
    await this.ensureConnection();

    logger.info("Listando clientes en Redis", {
      layer: "infrastructure",
      method: "listar"
    });

    const keys = await this.client.keys("cliente:*");
    const clientes = [];

    for (const key of keys) {
      const data = await this.client.get(key);
      const parsed = JSON.parse(data);

      clientes.push(new Cliente(parsed.id, parsed.nombre));
    }

    return clientes;

  }

  async buscarPorId(id) {
    await this.ensureConnection();

    logger.info("Buscando cliente en Redis", {
      layer: "infrastructure",
      method: "buscarPorId",
      id
    });

    const data = await this.client.get(`cliente:${id}`);
    if (!data) return null;

    const parsed = JSON.parse(data);
    return new Cliente(parsed.id, parsed.nombre);
  }

  async guardar(cliente) {
    await this.ensureConnection();

    logger.info("Guardando cliente en Redis", {
      layer: "infrastructure",
      method: "guardar",
      id: cliente.id
    });

    const key = `cliente:${cliente.id}`;
    await this.client.set(key, JSON.stringify(cliente));

    return cliente;
  }
}

module.exports = ClienteRedisRepository;