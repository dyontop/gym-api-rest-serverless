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
    const toEmail = this._getEmail(cliente);

    logger.info("Enviando email con SES", {
      layer: "infrastructure",
      service: "SesEmailService",
      clienteId: cliente.id,
      toEmail
    });

    try {
      const command = new SendEmailCommand({
        Source: this.fromEmail,
        Destination: {
          ToAddresses: [toEmail],
        },
        Message: {
          Subject: {
            Data: "Bienvenido 🚀",
            Charset: "UTF-8",
          },
          Body: {
            Text: {
              Data: `Hola ${cliente.nombre}, bienvenido a la plataforma.`,
              Charset: "UTF-8",
            },
            Html: {
              Data: `
                <html>
                  <body>
                    <h1>🚀 Bienvenido ${cliente.nombre}</h1>
                    <p>Gracias por registrarte en nuestra plataforma.</p>
                  </body>
                </html>
              `,
              Charset: "UTF-8",
            },
          },
        },
      });

      const response = await this.client.send(command);

      logger.info("Email enviado correctamente", {
        layer: "infrastructure",
        service: "SesEmailService",
        messageId: response.MessageId
      });

      return response;

    } catch (error) {

      // 🔥 Manejo más fino de errores
      if (error.name === "MessageRejected") {
        logger.error("SES rechazó el mensaje", {
          reason: error.message
        });
      } else {
        logger.error("Error enviando email SES", {
          error: error.message
        });
      }

      throw error;
    }
  }

  _getEmail(cliente) {
    // ✅ PRODUCCIÓN: esto debe venir del dominio
    if (!cliente.email) {
      throw new Error("Cliente no tiene email");
    }
    return cliente.email;
  }
}

module.exports = SesEmailService;