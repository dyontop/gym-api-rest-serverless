class Cliente {
  constructor(id, nombre) {
    if (!nombre || nombre.length < 3) {
      throw new Error('El nombre debe tener al menos 3 caracteres');
    }

    this.id = id;
    this.nombre = nombre;
  }
}

module.exports = Cliente;
