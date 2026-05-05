class User {
  constructor(id) {
    if (!id) {
      throw new Error("User id es requerido");
    }

    this.id = id;
  }
}

module.exports = User;