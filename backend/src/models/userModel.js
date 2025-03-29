class UserModel {
  constructor(user) {
    this.id = user.id ? user.id : '';
    this.first_name = user.firstname;
    this.last_name = user.lastname;
    this.email = user.email ? user.email : null;
    this.phone = user.phone ? user.phone : null;
  }
}

module.exports = UserModel;