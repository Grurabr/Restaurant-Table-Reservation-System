class RoomModel {
    constructor(room) {
      this.id = Number(room.id_room);
      this.floor = Number(room.floor);
      this.name = room.name;
    }
  }
  
module.exports = RoomModel;