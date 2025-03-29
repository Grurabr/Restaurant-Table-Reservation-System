class ReservationModel {
    constructor(reservation) {
      this.id_rest = Number(reservation.id_restaurant);
      this.id_table = Number(reservation.id_table);
      this.id_user = Number(reservation.id_user);
      this.booking_start = reservation.booking_start;
      this.duration = Number(reservation.duration);
      this.confirmation = 0;
      this.number_of_guests = Number(reservation.number_of_guests);
      this.additional_services = reservation.additional_services;
    }
  }
  
  module.exports = ReservationModel;