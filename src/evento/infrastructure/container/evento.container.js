const EventoMemoryRepository = require('../repository/memory/evento.memory.repository');
const EventoDynamoRepository = require('../repository/dynamodb/evento.dynamodb.repository');

const RegistrarEvento = require('@modules/evento/application/usecases/registrar-evento.usecase');
const ObtenerEventos = require('@modules/evento/application/usecases/obtener-evento.usecase');

const logger = require('@common/logger');

let instance = null;

/**
 * Factory de repositorio de eventos
 */
function createEventoRepository() {
  const isOffline = String(process.env.IS_OFFLINE) === 'true';

  logger.info('Inicializando repository de eventos', {
    layer: 'config',
    module: 'evento',
    isOffline,
  });

  const RepositoryClass = isOffline ? EventoMemoryRepository : EventoDynamoRepository;

  logger.info('Repository de eventos seleccionado', {
    layer: 'config',
    module: 'evento',
    repository: RepositoryClass.name,
  });

  return new RepositoryClass();
}

/**
 * Inicialización del módulo evento (Singleton)
 */
function build() {
  if (instance) {
    logger.info('Reutilizando instancia de evento.container', {
      layer: 'config',
      module: 'evento',
    });
    return instance;
  }

  logger.info('Inicializando dependencias del módulo evento', {
    layer: 'config',
    module: 'evento',
  });

  const repository = createEventoRepository();

  /**
   * Casos de uso
   */
  instance = {
    registrarEvento: new RegistrarEvento(repository),
    obtenerEventos: new ObtenerEventos(repository),
  };

  return instance;
}

module.exports = build;
