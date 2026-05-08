const logger = require('@common/logger');

class ConsoleEventPublisher {
  async publish(event) {
    logger.info('Evento publicado (console)', {
      layer: 'infrastructure',
      service: 'ConsoleEventPublisher',
      type: event.type,
    });

    console.log('📢 EVENT:', event);
  }
}

module.exports = ConsoleEventPublisher;
