class Evento {
  constructor({ id, userId, type, timestamp }) {
    if (!id) {
      throw new Error("id es requerido");
    }

    if (!userId) {
      throw new Error("userId es requerido");
    }

    if (!type) {
      throw new Error("type es requerido");
    }

    this.id = id;
    this.userId = userId;
    this.type = type;
    this.timestamp = timestamp || new Date().toISOString();

    // 🔥 Inmutabilidad
    Object.freeze(this);    //no cambia las propiedades del objeto, es inmutable
  }
}

module.exports = Evento;