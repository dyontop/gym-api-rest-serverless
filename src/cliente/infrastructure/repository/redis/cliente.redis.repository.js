const { createClient } = require("redis");
const ClienteRepository = require("@modules/cliente/domain/repository/cliente.repository");
const Cliente = require("@modules/cliente/domain/entities/cliente");
const logger = require("@common/logger");

let connectionPromise = null;

class ClienteRedisRepository extends ClienteRepository {

  constructor() {
    super();
    this.retries = 0;
    this.client = createClient({
      url: process.env.REDIS_URL || "redis://localhost:6379",
      socket: {
        reconnectStrategy: (retries) => {
          this.retries = retries;

          if (retries > 3) {
            logger.error("Redis no disponible después de varios intentos", {
              layer: "infrastructure",
              repository: "ClienteRedisRepository",
              retries
            });
            return new Error("Redis no disponible");
          }
          return 500; // reintenta cada 500ms
        }
      }
    });
    
    // Eventos importantes
    this.client.on("error", (err) => {
      if (this.retries > 3) return; // evitar ruido después del fallo final

      logger.error("Error de conexión Redis", {
        layer: "infrastructure",
        repository: "ClienteRedisRepository",
        error: err.message || "Sin detalle",
        url: process.env.REDIS_URL
      });
    });

    this.client.on("reconnecting", () => {
      logger.warn("Redis reconectando...", {
        layer: "infrastructure",
        repository: "ClienteRedisRepository",
        intento: this.retries
      });
    });

    this.client.on("connect", () => {
      logger.info("Socket Redis conectado", {
        layer: "infrastructure",
        repository: "ClienteRedisRepository"
      });
    });

    this.client.on("ready", () => {
      logger.info("Redis listo para operaciones", {
        layer: "infrastructure",
        repository: "ClienteRedisRepository"
      });
    });

    this.client.on("end", () => {
      logger.warn("Conexión Redis cerrada", {
        layer: "infrastructure",
        repository: "ClienteRedisRepository"
      });
    });

  }

  async ensureConnection() {
    if (this.client.isOpen) return;  // Evitar reconectar si ya está conectado (propio de Redis v4)

    if (!connectionPromise) { // Evita múltiples conexiones concurrentes, Solo la primera request crea la conexión. Las demás esperan la misma promesa (N requests al mismo tiempo pueden intentar conectar) 
      
      logger.info("Intentando conectar a Redis", {
        layer: "infrastructure",
        repository: "ClienteRedisRepository",
        url: process.env.REDIS_URL
      });

      connectionPromise = this.client.connect()
        .then(() => {
          logger.info("Conexión Redis establecida", {
            layer: "infrastructure",
            repository: "ClienteRedisRepository"
          });
        })
        .catch((error) => {
          logger.error("Fallo definitivo conectando a Redis", {
            layer: "infrastructure",
            repository: "ClienteRedisRepository",
            error: error.message,
            retries: this.retries
          });

          connectionPromise = null; // Reset SOLO si falla

          throw error;
        });
    }
     return connectionPromise;
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