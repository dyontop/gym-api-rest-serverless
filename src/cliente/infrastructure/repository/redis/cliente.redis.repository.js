const { createClient } = require("redis");
const ClienteRepository = require("@modules/cliente/domain/repository/cliente.repository");
const Cliente = require("@modules/cliente/domain/entities/cliente");
const logger = require("@common/logger");

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
    if (this.client.isOpen) return;  // evitar doble conexión (propio de Redis v4)

    try {
      await this.client.connect();

      logger.info("Redis conectado", {
        layer: "infrastructure",
        repository: "ClienteRedisRepository"
      });

    } catch (error) {
      logger.error("Error conectando a Redis", {
        error: error.message
      });
      throw error;
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