module.exports = {
  LISTAR_CLIENTES: 'SELECT id, nombre FROM clientes',
  BUSCAR_CLIENTE_POR_ID: 'SELECT id, nombre FROM clientes WHERE id = $1',
  CREAR_CLIENTE: 'INSERT INTO clientes(id, nombre) VALUES($1, $2) RETURNING id, nombre ',
};
