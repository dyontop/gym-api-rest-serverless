/**
 * Container del módulo (Composition & Dependency Resolver)
 *
 * Este archivo se encarga de construir y ensamblar las dependencias internas
 * del módulo (repositorios, casos de uso y servicios), resolviendo las
 * implementaciones concretas que se utilizarán en tiempo de ejecución.
 *
 * Responsabilidades:
 * - Resolver e instanciar las dependencias del módulo (ej: repositories)
 * - Definir qué implementación se utiliza según el contexto (ej: memory, DynamoDB)
 * - Construir los casos de uso con sus dependencias ya inyectadas
 * - Exponer el módulo listo para ser consumido por el container global
 *
 * Nota:
 * - SOLO compone y conecta dependencias internas del módulo
 */

const ClienteMemoryRepository = require('../repository/memory/cliente.memory.repository');
const ClientePostgresRepository = require('../repository/postgres/cliente.postgres.repository');
const ClienteRedisRepository = require('../repository/redis/cliente.redis.repository');

const ConsoleEventPublisher = require('../services/event/event.console.publisher');
const SnsEventPublisher = require('../services/event/event.sns.publisher');

const ObtenerClientes = require('@modules/cliente/application/usecases/obtener-clientes.usecase');
const ObtenerCliente = require('@modules/cliente/application/usecases/obtener-cliente.usecase');
const AgregarCliente = require('@modules/cliente/application/usecases/agregar-cliente.usecase');

const logger = require('@common/logger');

let instance = null;

/**
 * 🏭 Factory de repositorio
 */
function createRepository() {
  const provider = process.env.DB_PROVIDER;

  logger.info('Inicializando repository', {
    layer: 'config',
    module: 'cliente',
    provider,
  });

  if (!provider) {
    throw new Error('[ClienteContainer] DB_PROVIDER no está definido');
  }

  const providers = {
    postgres: ClientePostgresRepository,
    redis: ClienteRedisRepository,
    memory: ClienteMemoryRepository,
  };

  const RepositoryClass = providers[provider];

  if (!RepositoryClass) {
    logger.error('DB_PROVIDER inválido', { provider });
    throw new Error('DB_PROVIDER inválido');
  }

  logger.info('Repository seleccionado', {
    layer: 'config',
    module: 'cliente',
    repository: RepositoryClass.name,
  });

  return new RepositoryClass();
}

/**
 * 🏭 Factory de event publisher
 */
function createEventPublisher() {
  const eventProvider = process.env.EVENT_PROVIDER || 'console';

  logger.info('Inicializando event publisher', {
    layer: 'config',
    module: 'cliente',
    provider: eventProvider,
  });

  const providers = {
    console: ConsoleEventPublisher,
    sns: SnsEventPublisher,
  };

  const EventClass = providers[eventProvider];

  if (!EventClass) {
    throw new Error('EVENT_PROVIDER inválido');
  }

  return new EventClass();
}

/**
 * 🧱 Inicialización del módulo cliente (Singleton)
 */
function build() {
  if (instance) {
    logger.info('Reutilizando instancia de cliente.container', {
      layer: 'config',
      module: 'cliente',
    });
    return instance;
  }

  logger.info('Inicializando dependencias del módulo cliente', {
    layer: 'config',
    module: 'cliente',
  });

  const repository = createRepository();
  const eventPublisher = createEventPublisher();

  /**
   * ⚙️ Casos de uso
   */
  instance = {
    obtenerClientes: new ObtenerClientes(repository),
    obtenerCliente: new ObtenerCliente(repository),
    agregarCliente: new AgregarCliente(repository, eventPublisher),
  };

  return instance;
}

module.exports = build;
