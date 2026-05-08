const ClienteRepository = require('@modules/cliente/domain/repository/cliente.repository');
const Cliente = require('@modules/cliente/domain/entities/cliente');
const logger = require('@common/logger');

let clientes = [new Cliente('1', 'Carlos'), new Cliente('2', 'Ana')];

class ClienteMemoryRepository extends ClienteRepository {
  async listar() {
    logger.info('Listando clientes en memoria', {
      layer: 'infrastructure',
      repository: 'ClienteMemoryRepository',
      method: 'listar',
    });
    return clientes;
  }

  async buscarPorId(id) {
    logger.info('Buscando cliente en memoria', {
      layer: 'infrastructure',
      repository: 'ClienteMemoryRepository',
      method: 'buscarPorId',
      id,
    });
    return clientes.find(c => c.id === id);
  }

  async guardar(cliente) {
    logger.info('Guardando cliente en memoria', {
      layer: 'infrastructure',
      repository: 'ClienteMemoryRepository',
      method: 'guardar',
      id: cliente.id,
    });
    clientes.push(cliente);
    return cliente;
  }
}

module.exports = ClienteMemoryRepository;
