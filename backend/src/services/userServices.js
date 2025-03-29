const {pool} = require('../config/db');
const { encrypt, decrypt } = require('../utils/crypto');

// Get all users
const getAllUsers = async () => {
    try {
        // List of users
        const [users] = await pool.execute("SELECT * FROM Users");
        return {success:true, users: users.map(user => ({
          ...user,
          phone: decrypt(user.phone),
          email: decrypt(user.email),
          first_name: decrypt(user.first_name),
          last_name: decrypt(user.last_name)
        }))};

    } catch(error) {
        return {success:false, message:"Error fetching users", error:error};
    }
}

// Get list of available tables
const getAvailableTables = async (bookingDateTime, capacity) => {
    try {
        // List of available tables
        const query=`SELECT * FROM Tables 
            WHERE is_deleted = 0 
            AND capacity >= ? 
            AND id_table NOT IN (
            SELECT id_table FROM Reservation 
            WHERE booking_start BETWEEN DATE_SUB(?, INTERVAL 2 HOUR) 
            AND DATE_ADD(?, INTERVAL 2 HOUR)
            )`;
        const values=[capacity, bookingDateTime, bookingDateTime];

        const [tables] = await pool.execute(query, values);

        return {success:true, tables: tables};

    } catch(error) {
        return {success:false, message:"Error fetching tables", error:error};
    }
}

// Get list of additional services
const getAdditionalServices = async () => {
    try {
        // List of additional services
        const [services] = await pool.execute(`
            SELECT id_additional_services, service_name, description, price 
            FROM additional_services
        `);

        return {success:true, services: services};

    } catch(error) {
        return {success:false, message:"Error fetching additional services", error:error};
    }
}

// Update user data
const updateUserData = async (user) => {
    try {
        // Update user data
        const query = `UPDATE Users SET first_name = ?, last_name = ?, phone = ? WHERE email = ?`;
        //console.log("Update user data no crypt: ", user)
        const values=[encrypt(user.first_name), encrypt(user.last_name), encrypt(user.phone), encrypt(user.email)];
        //console.log("Update user data: ", values)
        await pool.execute(query, values);

        return {success:true, message:"Profile updated successfully"};

    } catch(error) {
        return {success:false, message:"Error updating user profile", error:error};
    }
}

// Create new user reservation
const addUserReservation = async (reserv) => {
    try{
        //Check the table is still free
        const checkQuery = `SELECT COUNT(*) FROM Reservation
                        WHERE id_table = ?
                        AND booking_Start < Date_ADD (?, INTERVAL duration MINUTE)
                        AND DATE_ADD(booking_start, INTERVAL duration MINUTE) > ?`
        
        const [existingReservation] = await pool.execute(checkQuery, [reserv.id_table, reserv.booking_start, reserv.booking_start])

        if(existingReservation[0].count > 0){
            return {success: false, message: "The table is already in use, try again"}
        }
    
        // Create new user reservation
        const query = `INSERT INTO Reservation 
        (id_restaurant, id_table, id_user, booking_start, duration, confirmation, number_of_guests, additional_services) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
        const values = [
            reserv.id_rest, 
            reserv.id_table, 
            reserv.id_user, 
            reserv.booking_start, 
            reserv.duration, 
            reserv.confirmation || 0, 
            reserv.number_of_guests, 
            reserv.additional_services
        ];
        const [result] = await pool.execute(query, values);
        const insertedId = result.insertId;

        // We get the data of the newly inserted booking, merging it with the user data
        const selectQuery = `SELECT r.*, u.email, u.first_name, u.last_name 
                             FROM Reservation r 
                             JOIN users u ON r.id_user = u.id_user 
                             WHERE r.id_reservation = ?`;
        const [rows] = await pool.execute(selectQuery, [insertedId]);
        if (rows.length > 0) {
          return { success: true, message: "Reservation added successfully", reservation: {
            ...rows[0],
            email: decrypt(rows[0].email),
            first_name: decrypt(rows[0].first_name),
            last_name: decrypt(rows[0].last_name)
          }};
        } else {
            return { success: true, message: "Reservation added successfully, but details not found", reservation: null };
        }
    } catch (error) {
        return { success: false, message: "Error inserting reservation", error: error };
    }
}

const deleteClientReservationService = async (id) => {
    try {
      // Getting reservation data with user information
      const [rows] = await pool.execute(
        `SELECT r.*, u.email, u.first_name, u.last_name
         FROM reservation r
         JOIN Users u ON r.id_user = u.id_user
         WHERE r.id_reservation = ?`,
        [id]
      );
      if (rows.length === 0) {
        return { success: false, message: "Reservation not found" };
      }

      // Decrypt users data
      rows[0].first_name = decrypt(rows[0].first_name);
      rows[0].last_name = decrypt(rows[0].last_name);
      rows[0].email = decrypt(rows[0].email);

      const reservation = rows[0];
  
      // Delete the reservation
      await pool.execute(`DELETE FROM reservation WHERE id_reservation = ?`, [id]);
  
      return {
        success: true,
        message: "Reservation deleted successfully",
        reservation
      };
    } catch (error) {
      return { success: false, message: "Error deleting reservation", error };
    }
  };

/**
 * Updates the reservation by the given id with new data.
 * After updating, returns the updated reservation object.
 */
async function updateReservation(id, newData) {
    try {
      const updateSql = `
        UPDATE reservation 
        SET booking_start = ?, number_of_guests = ?, id_table = ?, additional_services = ?, confirmation = 0
        WHERE id_reservation = ?
      `;
  
      const booking_start = newData.booking_start === undefined ? null : newData.booking_start;
      const number_of_guests = newData.number_of_guests === undefined ? null : newData.number_of_guests;
      const id_table = newData.id_table === undefined ? null : newData.id_table;
      const additional_services = newData.additional_services === undefined ? null : newData.additional_services;
      const reservationId = id === undefined ? null : id;
  
      const params = [booking_start, number_of_guests, id_table, additional_services, reservationId];
      const [result] = await pool.execute(updateSql, params);
      console.log("Update result:", result);
  
      if (result.affectedRows > 0) {
        // Updated selection with additional table data.
        // Instead of t.number we use t.id_table, since the number field is not in the table.
        const selectSql = `
          SELECT r.*, u.email, u.first_name, u.last_name, t.capacity AS table_capacity, t.id_table AS table_number
          FROM reservation r
          JOIN Users u ON r.id_user = u.id_user
          LEFT JOIN tables t ON r.id_table = t.id_table
          WHERE r.id_reservation = ?
        `;
        const [rows] = await pool.execute(selectSql, [reservationId]);
        console.log("Fetched updated reservation:", rows);

        return {
          ...rows[0],
          email: decrypt(rows[0].email),
          first_name: decrypt(rows[0].first_name),
          last_name: decrypt(rows[0].last_name)
        };
      } else {
        return null;
      }
    } catch (error) {
      console.error("Error in updateReservation service:", error);
      throw error;
    }
  }
  


// Get list of user reservations
const getUserReservations = async (id_user) => {
    try {
        // List of user reservations
        const [reservations] = await pool.execute(`
            SELECT id_reservation, id_table, booking_start, duration, number_of_guests, additional_services 
            FROM reservation
            WHERE id_user = ?
            ORDER BY booking_start DESC
        `, [id_user]);

        return {success:true, reservations: reservations};

    } catch(error) {
        return {success:false, message:"Error fetching reservations", error:error};
    }
}


module.exports = {getAvailableTables, getAdditionalServices, updateUserData, getAllUsers, addUserReservation, getUserReservations, deleteClientReservationService, updateReservation};