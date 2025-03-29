const ReservationModel = require("../models/reservationModel");
const UserModel = require("../models/userModel");
const transporter = require('../config/nodemailer');
const { getAvailableTables, getAdditionalServices, updateUserData, getAllUsers, addUserReservation, getUserReservations, deleteClientReservationService, updateReservation } = require("../services/userServices");
const { pool } = require('../config/db');

// Get all users
const getUsers = async (req, res) => {
  try {
    const response = await getAllUsers();
    if (response.success) {
      return res.status(200).json(response.users);
    } else {
      return res.status(400).json(response);
    }
  } catch (err) {
    console.error("Error fetching users: ", err);
    return res.status(500).json({ error: "Error fetching users" });
  }
};

// Get list of available tables
const getTables = async (req, res) => {
  const { date, time, capacity } = req.body;
  const bookingDateTime = `${date} ${time}:00`;

  try {
    const response = await getAvailableTables(bookingDateTime, capacity);
    if (response.success) {
      return res.status(200).json(response.tables);
    } else {
      return res.status(400).json(response);
    }
  } catch (err) {
    console.error("Error fetching tables: ", err);
    return res.status(500).json({ error: "Error fetching tables" });
  }

}

// Get list of additional services
const getServices = async (req, res) => {
  try {
    const response = await getAdditionalServices();
    if (response.success) {
      return res.status(200).json(response.services);
    } else {
      return res.status(400).json(response);
    }
  } catch (err) {
    console.error("Error fetching additional services: ", err);
    return res.status(500).json({ error: "Error fetching additional services" });
  }
}

// Update user data
const updateUser = async (req, res) => {
  const { firstname, lastname, phone, email } = req.body;

  const user = new UserModel({ firstname, lastname, email, phone });

  try {
    const response = await updateUserData(user);
    if (response.success) {
      return res.status(200).json(response);
    } else {
      console.log("userConrtoller, updateUser response", response)
      return res.status(400).json(response);
    }
  } catch (err) {
    console.error("Error updating user profile:", err);
    res.status(500).json({ error: "Error updating user profile" });
  }
}
// Function for obtaining details of additional services
const getAdditionalServicesDetails = async (servicesStr) => {
  if (!servicesStr) return "";
  const ids = servicesStr.split(",").map(id => id.trim());
  const placeholders = ids.map(() => '?').join(',');
  const query = `
    SELECT service_name, price 
    FROM additional_services 
    WHERE id_additional_services IN (${placeholders})
  `;
  try {
    const [rows] = await pool.execute(query, ids);
    if (rows.length === 0) return "";
    return `<ul>${rows.map(service => `<li>${service.service_name} - ${service.price}€</li>`).join('')}</ul>`;
  } catch (error) {
    console.error("Error fetching additional services details:", error);
    return "";
  }
};

// Create new user reservatioin
const addReservation = async (req, res) => {
  const { id_restaurant, id_table, id_user, date, time, duration, number_of_guests, additional_services } = req.body;
  const booking_start = `${date} ${time}:00`;

  const reservation = new ReservationModel({ id_restaurant, id_table, id_user, booking_start, duration, number_of_guests, additional_services });

  try {
    const response = await addUserReservation(reservation);
    if (response.success) {

      if (response.reservation) {
        const reservationData = response.reservation;

        // Format date in finnish format
        const formattedDate = new Date(reservation.booking_start).toLocaleString('fi-FI', {
          year: 'numeric', month: '2-digit', day: '2-digit',
          hour: '2-digit', minute: '2-digit'
        });

        // We receive an HTML list of selected services
        const additionalServicesHTML = await getAdditionalServicesDetails(reservation.additional_services);

        const mailOptions = {
          from: '"Restaurant Reservations" <dev.web.test.3@gmail.com>',
          to: reservationData.email,
          subject: 'Reservation Received',
          html: `<p>Hello, ${reservationData.first_name} ${reservationData.last_name}!</p>
                 <p>You have successfully made a reservation with the booking ID:<strong>${reservationData.id_reservation}</strong>.</p>
                  <p><strong>Date and time:</strong> ${formattedDate}</p>
                  <p><strong>Number of guests:</strong> ${reservation.number_of_guests}</p>
                  <p><strong>Table number:</strong> ${reservation.id_table}</p>
                  <p><strong>Additional Services:</strong></p>
                 ${additionalServicesHTML || "<p>No additional services selected.</p>"}
                 <p>Your reservation will be confirmed by an administrator shortly.</p>`
        };

        try {
          let info = await transporter.sendMail(mailOptions);
          console.log(`Reservation confirmation email sent to ${reservationData.email}`);
        } catch (emailError) {
          console.error("Error sending reservation confirmation email:", emailError);

        }
      }
      return res.status(200).json(response);
    } else {
      return res.status(400).json(response);
    }
  } catch (err) {
    console.error("Error inserting reservation:", err);
    res.status(500).json({ error: "Error inserting reservation" });
  }
}

// Client reservation delete handler
const deleteClientReservation = async (req, res) => {
  const { id } = req.body;

  try {
    const response = await deleteClientReservationService(id);
    if (response.success) {
      const reservation = response.reservation;

      // Format date in finnish format
      const formattedDate = new Date(reservation.booking_start).toLocaleString('fi-FI', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit'
      });

      // We receive an HTML list of selected services
      const additionalServicesHTML = await getAdditionalServicesDetails(reservation.additional_services);

      const mailOptions = {
        from: '"Restaurant Reservations" <dev.web.test.3@gmail.com>',
        to: reservation.email,
        subject: 'Your reservation has been cancelled',
        html: `<p>Hello, ${reservation.first_name} ${reservation.last_name}!</p>
               <p>Your reservation  with the booking ID: <strong>${reservation.id_reservation}</strong> scheduled for:
               <p><strong>Date and time:</strong> ${formattedDate}</p>
               <p><strong>Number of guests:</strong> ${reservation.number_of_guests}</p>
               <p><strong>Table number:</strong> ${reservation.id_table}</p>
               <p><strong>Additional Services:</strong></p>
               ${additionalServicesHTML || "<p>No additional services selected.</p>"}
               <p>has been cancelled by you.</p>
               <p>If this was not intended, please contact our support team immediately.</p>`
      };

      try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`Client cancellation email sent to ${reservation.email}, messageId: ${info.messageId}`);
      } catch (emailError) {
        console.error("Error sending client cancellation email:", emailError);
      }

      return res.status(200).json(response);
    } else {
      return res.status(400).json(response);
    }
  } catch (error) {
    console.error("Error deleting reservation:", error);
    return res.status(500).json({ error: "Error deleting reservation" });
  }
};

// Edit reservation

// Booking update handler for a client
const updateReservationHandler = async (req, res) => {
  const { id, newData } = req.body; // newData: { booking_start, number_of_guests, id_table, ... }
  try {
    const updatedReservation = await updateReservation(id, newData);
    if (updatedReservation) {
      // We format the date for the letter, for example, in Finnish format
      const formattedDate = new Date(updatedReservation.booking_start).toLocaleString('fi-FI', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit'
      });

      // We receive an HTML list of selected services
      const additionalServicesHTML = await getAdditionalServicesDetails(updatedReservation.additional_services);


      // We form the parameters of the letter with notification of a change in booking
      const mailOptions = {
        from: `"Restaurant Reservations" <${process.env.GMAIL_USER}>`,
        to: updatedReservation.email,
        subject: 'Your reservation has been updated',
        html: `<p>Hello, ${updatedReservation.first_name} ${updatedReservation.last_name}!</p>
               <p>Your reservation  with the booking ID: <strong>${updatedReservation.id_reservation}</strong> has been updated. Here are the new details:</p>
               <p><strong>Date and time:</strong> ${formattedDate}</p>
               <p><strong>Number of guests:</strong> ${updatedReservation.number_of_guests}</p>
               <p><strong>Table number:</strong> ${updatedReservation.id_table}</p>
               <p><strong>Additional Services:</strong></p>
               ${additionalServicesHTML || "<p>No additional services selected.</p>"}
               <p>If you have any questions, please contact our support team.</p>`
      };

      try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`Update email sent to ${updatedReservation.email}, messageId: ${info.messageId}`);
      } catch (emailError) {
        console.error("Error sending update email:", emailError);
      }
      return res.status(200).json({ success: true, reservation: updatedReservation });
    } else {
      return res.status(400).json({ success: false, message: "Reservation update failed" });
    }
  } catch (error) {
    console.error("Error updating reservation:", error);
    return res.status(500).json({ error: "Error updating reservation" });
  }
};

// Get list of user reservations
const getReservations = async (req, res) => {
  const { id_user } = req.body;

  if (!id_user) { return res.status(400).json({ error: "User ID is required" }) }

  try {
    const response = await getUserReservations(id_user);
    if (response.success) {
      return res.status(200).json(response.reservations);
    } else {
      return res.status(400).json(response);
    }
  } catch (err) {
    console.error("Error fetching reservations: ", err);
    return res.status(500).json({ error: "Error fetching reservations" });
  }
}

module.exports = { getUsers, getTables, getServices, updateUser, addReservation, getReservations, deleteClientReservation, updateReservationHandler };
