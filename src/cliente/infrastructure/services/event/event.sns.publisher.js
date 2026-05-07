const { SNSClient, PublishCommand } = require("@aws-sdk/client-sns");
const logger = require("@common/logger");

class SnsEventPublisher {
  constructor() {
    this.client = new SNSClient({
      region: process.env.AWS_REGION || "us-east-1",
    });

    this.topicArn = process.env.SNS_TOPIC_ARN;

    if (!this.topicArn) {
      throw new Error("SNS_TOPIC_ARN no está definido");
    }
  }

  async publish(event) {
    if (!event?.type) {
      throw new Error("Event type es requerido");
    }

    if (!event?.payload) {
      throw new Error("Event payload es requerido");
    }

    const message = {
      type: event.type,
      payload: event.payload,
      timestamp: new Date().toISOString(),
      correlationId: event.correlationId || null,
      source: "cliente-service"
    };

    logger.info("Publicando evento en SNS", {
      service: "SnsEventPublisher",
      type: event.type
    });

    try {
      const command = new PublishCommand({
        TopicArn: this.topicArn,
        Message: JSON.stringify(message),
        MessageAttributes: {
          eventType: {
            DataType: "String",
            StringValue: event.type
          }
        }
      });

      const response = await this.client.send(command);

      logger.info("Evento SNS publicado", {
        messageId: response.MessageId,
        eventType: event.type,
        topicArn: this.topicArn
      });

      return response;

    } catch (error) {
      logger.error("Error publicando evento SNS", {
        error: error.message,
        eventType: event.type
      });
      throw error;
    }
  }
}

module.exports = SnsEventPublisher;