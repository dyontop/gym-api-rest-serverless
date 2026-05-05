class EventPublisher {
  async publish(event) {
    throw new Error("EventPublisher.publish no implementado");
  }
}

module.exports = EventPublisher;