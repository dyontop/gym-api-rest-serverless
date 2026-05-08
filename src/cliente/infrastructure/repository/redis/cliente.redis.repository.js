const { createClient } = require('redis');
const ClienteRepository = require('@modules/cliente/domain/repository/cliente.repository');
const Cliente = require('@modules/cliente/domain/entities/cliente');
const logger = require('@common/logger');

let connectionPromise = null;

class ClienteRedisRepository extends ClienteRepository {
  constructor() {
    super();
    this.retries = 0;
    this.client = this.buildClient(); // Crear cliente inicial
  }

  buildClient() {
    const redisUrl =
      process.env.IS_OFFLINE === 'true'
        ? 'redis://localhost:6379' // Redis local para serverless offline
        : `redis://default:${process.env.REDIS_PASSWORD}` +
          `@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`; // Redis Cloud para dev|prod

    const client = createClient({
      // Crear cliente Redis con opciones de reconexión
      url: redisUrl,
      socket: {
        reconnectStrategy: retries => {
          this.retries = retries;

          logger.warn('Redis reconectando...', {
            layer: 'infrastructure',
            repository: 'ClienteRedisRepository',
            intento: retries,
          });

          if (retries > 3) {
            logger.error('Redis no disponible después de varios intentos', {
              layer: 'infrastructure',
              repository: 'ClienteRedisRepository',
              retries,
            });
            return new Error('Redis no disponible');
          }
          return 500; // reintenta cada 500ms
        },
      },
    });

    // Eventos Redis
    client.on('error', err => {
      if (this.retries > 3) return; // evitar ruido después del fallo final

      logger.error('Error de conexión Redis', {
        layer: 'infrastructure',
        repository: 'ClienteRedisRepository',
        error: err.message || 'Sin detalle',
      });
    });

    client.on('connect', () => {
      logger.info('Socket Redis conectado', {
        layer: 'infrastructure',
        repository: 'ClienteRedisRepository',
      });
    });

    client.on('ready', () => {
      logger.info('Redis listo para operaciones', {
        layer: 'infrastructure',
        repository: 'ClienteRedisRepository',
      });
    });

    client.on('end', () => {
      logger.warn('Conexión Redis cerrada', {
        layer: 'infrastructure',
        repository: 'ClienteRedisRepository',
      });
    });

    return client;
  }

  async ensureConnection() {
    if (this.client.isReady) return; // Utiliza la misma conexion si Redis ya está conectado

    if (!this.client || !this.client.isReady) {
      // Cliente cerrado o inexistente

      logger.warn('Recreando cliente Redis', {
        layer: 'infrastructure',
        repository: 'ClienteRedisRepository',
      });

      this.client = this.buildClient();
    }

    if (!connectionPromise) {
      // Evita múltiples conexiones concurrentes, Solo la primera request crea la conexión. Las demás esperan la misma promesa (N requests al mismo tiempo pueden intentar conectar)

      logger.info('Intentando conectar a Redis', {
        layer: 'infrastructure',
        repository: 'ClienteRedisRepository',
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
      });

      connectionPromise = this.client
        .connect()
        .then(() => {
          logger.info('Conexión Redis establecida', {
            layer: 'infrastructure',
            repository: 'ClienteRedisRepository',
          });
        })
        .catch(error => {
          logger.error('Fallo definitivo conectando a Redis', {
            layer: 'infrastructure',
            repository: 'ClienteRedisRepository',
            error: error.message,
            retries: this.retries,
          });

          throw error;
        })
        .finally(() => {
          connectionPromise = null;
        });
    }
    return connectionPromise;
  }

  async listar() {
    await this.ensureConnection();

    logger.info('Listando clientes en Redis', {
      layer: 'infrastructure',
      method: 'listar',
    });

    const keys = await this.client.keys('cliente:*');
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

    logger.info('Buscando cliente en Redis', {
      layer: 'infrastructure',
      method: 'buscarPorId',
      id,
    });

    const data = await this.client.get(`cliente:${id}`);
    if (!data) return null;

    const parsed = JSON.parse(data);
    return new Cliente(parsed.id, parsed.nombre);
  }

  async guardar(cliente) {
    await this.ensureConnection();

    logger.info('Guardando cliente en Redis', {
      layer: 'infrastructure',
      method: 'guardar',
      id: cliente.id,
    });

    const key = `cliente:${cliente.id}`;
    await this.client.set(key, JSON.stringify(cliente));

    return cliente;
  }
}

module.exports = ClienteRedisRepository;
