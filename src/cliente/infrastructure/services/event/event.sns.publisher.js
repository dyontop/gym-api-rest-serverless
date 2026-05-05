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
    logger.info("Publicando evento en SNS", {
      layer: "infrastructure",
      service: "SnsEventPublisher",
      type: event.type
    });

    try {
      const params = {
        TopicArn: this.topicArn,
        Message: JSON.stringify({
          type: event.type,
          payload: event.payload,
          timestamp: new Date().toISOString()
        }),
        MessageAttributes: {
          eventType: {
            DataType: "String",
            StringValue: event.type
          }
        }
      };

      const command = new PublishCommand(params);
      const response = await this.client.send(command);

      logger.info("Evento publicado correctamente", {
        messageId: response.MessageId
      });

      return response;

    } catch (error) {
      logger.error("Error publicando evento SNS", {
        error: error.message
      });
      throw error;
    }
  }
}

module.exports = SnsEventPublisher;