const { Pool } = require('pg');
const ClienteRepository = require('@modules/cliente/domain/repository/cliente.repository');
const Cliente = require('@modules/cliente/domain/entities/cliente');
const queries = require('@modules/cliente/infrastructure/repository/queriesDb/cliente.queries');
const logger = require('@common/logger');

class ClientePostgresRepository extends ClienteRepository {
  constructor() {
    super();
    this.pool = new Pool({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,

      connectionTimeoutMillis: 2000, // CRÍTICO: evita cuelgues
      idleTimeoutMillis: 5000,
    });
  }

  async listar() {
    logger.info('Query listar clientes', {
      layer: 'infrastructure',
      repository: 'ClientePostgresRepository',
      method: 'listar',
    });

    try {
      const result = await this.pool.query(queries.LISTAR_CLIENTES);
      return result.rows.map(row => new Cliente(row.id, row.nombre));
    } catch (error) {
      logger.error('Error en listar clientes (Postgres)', {
        repository: 'ClientePostgresRepository',
        error: error.message,
      });
      throw error;
    }
  }

  async buscarPorId(id) {
    logger.info('Query buscar cliente', {
      layer: 'infrastructure',
      repository: 'ClientePostgresRepository',
      method: 'buscarPorId',
      id,
    });

    try {
      const result = await this.pool.query(queries.BUSCAR_CLIENTE_POR_ID, [id]);
      const row = result.rows[0];
      if (!row) return null;
      return new Cliente(row.id, row.nombre);
    } catch (error) {
      logger.error('Error en buscar cliente (Postgres)', {
        repository: 'ClientePostgresRepository',
        id,
        error: error.message,
      });
      throw error;
    }
  }

  async guardar(cliente) {
    logger.info('Query guardar cliente', {
      layer: 'infrastructure',
      repository: 'ClientePostgresRepository',
      method: 'guardar',
      id: cliente.id,
    });

    try {
      const result = await this.pool.query(queries.CREAR_CLIENTE, [cliente.id, cliente.nombre]);

      const row = result.rows[0];
      return new Cliente(row.id, row.nombre);
    } catch (error) {
      logger.error('Error en guardar cliente (Postgres)', {
        repository: 'ClientePostgresRepository',
        error: error.message,
      });
      throw error;
    }
  }
}

module.exports = ClientePostgresRepository;
