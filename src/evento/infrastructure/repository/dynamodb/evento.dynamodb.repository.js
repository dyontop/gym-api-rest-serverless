const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');

const EventoRepository = require('@modules/evento/domain/repository/evento.repository');
const Evento = require('@modules/evento/domain/entities/evento');
const logger = require('@common/logger');
const { dynamo } = require('@config/database.config');

class EventoDynamoRepository extends EventoRepository {
  constructor() {
    super();

    const client = new DynamoDBClient({
      region: dynamo.region,
      endpoint: dynamo.isOffline ? dynamo.endpoint : undefined,
      credentials: dynamo.isOffline ? dynamo.credentials : undefined,
    });

    this.db = DynamoDBDocumentClient.from(client);
    this.tableName = process.env.EVENTOS_TABLE;
  }

  async guardar(evento) {
    logger.info('Guardando evento en DynamoDB', {
      layer: 'infrastructure',
      repository: 'EventoDynamoRepository',
      method: 'guardar',
      id: evento.id,
      userId: evento.userId,
    });

    await this.db.send(
      new PutCommand({
        TableName: this.tableName,
        Item: {
          userId: evento.userId,
          timestamp: evento.timestamp,
          id: evento.id,
          type: evento.type,
        },
      })
    );

    return evento;
  }

  async listarPorUsuario(userId) {
    logger.info('Consultando eventos en DynamoDB', {
      layer: 'infrastructure',
      repository: 'EventoDynamoRepository',
      method: 'listarPorUsuario',
      userId,
    });

    const result = await this.db.send(
      new QueryCommand({
        TableName: this.tableName,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId,
        },
        ScanIndexForward: false, // últimos eventos primero
      })
    );

    return (result.Items || []).map(
      item =>
        new Evento({
          id: item.id,
          userId: item.userId,
          type: item.type,
          timestamp: item.timestamp,
        })
    );
  }
}

module.exports = EventoDynamoRepository;
