const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");
const logger = require("@common/logger");

class SesEmailService {
  constructor() {
    this.client = new SESClient({
      region: process.env.AWS_REGION || "us-east-1",
    });

    this.fromEmail = process.env.SES_FROM_EMAIL;

    if (!this.fromEmail) {
      throw new Error("SES_FROM_EMAIL no está definido");
    }
  }

  async enviarBienvenida(cliente) {
    logger.info("Enviando email con SES", {
      layer: "infrastructure",
      service: "SesEmailService",
      clienteId: cliente.id
    });

    try {
      const params = {
        Source: this.fromEmail,
        Destination: {
          ToAddresses: [this._getEmail(cliente)]
        },
        Message: {
          Subject: {
            Data: "Bienvenido 🚀",
          },
          Body: {
            Text: {
              Data: `Hola ${cliente.nombre}, bienvenido a la plataforma.`,
            },
          },
        },
      };

      const command = new SendEmailCommand(params);
      const response = await this.client.send(command);

      logger.info("Email enviado correctamente", {
        messageId: response.MessageId
      });

      return response;

    } catch (error) {
      logger.error("Error enviando email SES", {
        error: error.message
      });
      throw error;
    }
  }

  _getEmail(cliente) {
    // ⚠️ temporal (ideal: cliente.email)
    return `${cliente.nombre.toLowerCase()}@example.com`;
  }
}

module.exports = SesEmailService;