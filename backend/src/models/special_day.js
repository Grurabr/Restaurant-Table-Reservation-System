class SpecialDayModel {
    constructor(special_day) {
      this.id_rest = special_day.id_restaurant ? Number(special_day.id_restaurant) : 1;
      console.log('day from model', special_day.day);
      this.day = special_day.day;
      this.is_closed = Number(special_day.is_closed);
      this.is_special = Number(special_day.is_special);
      this.open_time = special_day.open_time;
      this.close_time = special_day.close_time
    }
}
  
module.exports = SpecialDayModel;