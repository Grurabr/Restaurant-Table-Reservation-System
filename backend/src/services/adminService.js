const {pool} = require('../config/db');
const { encrypt, decrypt } = require('../utils/crypto');

// Get list of services by Id
const getServicesById = async (servicesId) => {
    try {
        const editedServices = servicesId.map(()=> "?").join(", ")
        servicesId = servicesId.split(",").map(Number);

        // List of services by Id
        const [services] = await pool.execute(`SELECT * FROM additional_services WHERE id_additional_services IN (${editedServices})`, servicesId);

        return {success:true, services: services};

    } catch(error) {
        return {success:false, message:"Error fetching services", error:error};
    }
}

// Get list of reservations by date
const getReservationsByDate = async (date) => {
    try {
        // Date condition
        let condition = ` WHERE DATE(r.booking_start) = ? `;
        if (!date) {
            date = new Date().toISOString().split("T")[0];
            condition = ` WHERE DATE(r.booking_start) >= ? `;
        }

        // List of reservations by date
        let query = `SELECT r.*, u.first_name, u.last_name, u.email, u.phone 
            FROM reservation r
            JOIN users u ON r.id_user = u.id_user ` + 
            condition +
            `ORDER BY r.booking_start`;
        let values = [date];

        const [reservations] = await pool.execute(query, values);

        // Decrypt data
        reservations.forEach(reservation => {
            reservation.first_name = decrypt(reservation.first_name);
            reservation.last_name = decrypt(reservation.last_name);
            reservation.email = decrypt(reservation.email);
            reservation.phone = decrypt(reservation.phone);
        });

        return {success:true, reservations: reservations};

    } catch(error) {
        return {success:false, message:"Error fetching reservations", error:error};
    }
}

// Approve reservation
const approveReservation = async (id) => {
    try {
        // Approve reservation
        await pool.execute(`UPDATE reservation SET confirmation = 1 WHERE id_reservation = ?`, [id]);

        // Receiving booking data and user information
        const query = `SELECT r.*, u.email, u.first_name, u.last_name 
                            FROM reservation r
                            JOIN Users u ON r.id_user = u.id_user 
                            WHERE r.id_reservation = ?`;

        const [rows] = await pool.execute(query, [id]);

        // Decrypt user data
        if (rows.length > 0) {
            rows[0].first_name = decrypt(rows[0].first_name);
            rows[0].last_name = decrypt(rows[0].last_name);
            rows[0].email = decrypt(rows[0].email);
        }

        return {success:true, reservation: rows[0]};
    } catch(error) {
        return {success:false, message:"Error approving reservations", error:error};
    }
}

// Delete reservation
const deleteReservation = async (id) => {
    try {
        // Receive booking data along with user information
        const [rows] = await pool.execute(
            `SELECT r.*, u.email, u.first_name, u.last_name 
            FROM reservation r 
            JOIN users u ON r.id_user = u.id_user 
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
    
        // Delete the booking
        await pool.execute(`DELETE FROM reservation WHERE id_reservation = ?`, [id]);
    
        // Returning the result with the booking data for notification by e-mail
        return {
            success: true,
            message: "Reservation deleted successfully",
            reservation: reservation
        };
    } catch (error) {
      return { success: false, message: "Error deleting reservation", error: error };
    }
  }
  


// Load restaurant schema
const loadSchema = async () => {
    try {
        // layoutSchema
        const [layoutSchema] = await pool.execute(`SELECT * FROM restaurant_layout`); 
        // Rooms 
        const [rooms] = await pool.execute(`SELECT * FROM rooms`); 
        // Unused Tables
        const [unusedTables] = await pool.execute(`SELECT * FROM unusedtables`); 

        return {success: true, layoutSchema: layoutSchema, rooms:rooms, unusedTables:unusedTables}

    } catch (error) {
        return {success:false, message:"Tables getting failed!", error:error};
    }
}

// Load schema elements
const loadElements = async () => {
    try {
        // Elements
        const [elements] = await pool.execute(`SELECT * FROM elements`);
        // Tables
        const [tables] = await pool.execute(`SELECT * FROM tables ORDER BY id_table`);
        
        return {success: true, elements: elements, tables: tables}
    } catch (error) {
        return {success:false, message:"Elements getting failed!", error:error};
    }
}


// Save restaurant schema
const saveElements = async (elements, addedTables) => {
    try {
        const tablesJson = JSON.stringify(addedTables);
        const layoutJson = JSON.stringify(elements);

        const query = `CALL save_restaurant_layout(?, ?)`;
        await pool.execute(query, [tablesJson, layoutJson]);

        return { success: true, message: "Restaurant schema saved successfully" };
    } catch(error) {
        let message = "Restaurant schema saving failed";
        if (error.errno == 1062){ message = "Table with such number already exists" }
        return {success:false, message:message, error:error};

    }
}

// Create new room
const createRoom = async (floor, name) => {
    try {
        // Create new room
        const responce = await pool.execute(`INSERT INTO rooms (floor, name) VALUES (?, ?)`, [floor, name]);
        
        return {success:true, message:"Room created successfully", id: responce[0].insertId};
    } catch(error) {
        let message = "Room creating failed";
        if (error.errno == 1062){ message = "Room with such number already exists" }
        return {success:false, message:message, error:error};

    }
}

// Update room data
const updateRoomData = async (room) => {
    try {
        // Update room values
        await pool.execute(`UPDATE rooms SET floor=?, name=? WHERE id_room=?`, [room.floor, room.name, room.id]);
        
        return {success:true, message:"Room updated successfully"};
    } catch(error) {
        return {success:false, message:"Room updating failed", error:error};

    }
}

// Delete room
const deleteRoomFromDB = async (id_room) => {
    try {
        // Delete room
        await pool.execute(`CALL delete_room(?)`, [id_room]);
        return {success:true, message:"Room deleted successfully"};
    } catch(error) {
        return {success:false, message:"Room deleting failed", error:error};

    }
}

// Get restaurant hours
const getRestaurantHours = async () => {
    try{
        const [hours] = await pool.execute(`SELECT * FROM restaurant_hours WHERE id_restaurant = ? ORDER BY id ASC`, [1]);
        
        //console.log("admServ hours:", hours)
        return {success:true, hours: hours};
    } catch(error){
        return {success:false, message:"Hours getting failed", error:error}
    }
}

// Update hours
const updateRestaurantHours = async(id_restaurant, hours) => {
    try{
        for (const {day, open_time, close_time, is_closed} of hours){
            await pool.execute(`INSERT INTO restaurant_hours (id_restaurant, day, open_time, close_time, is_closed)
                                VALUES(?, ?, ?, ?, ?)
                                ON DUPLICATE KEY UPDATE
                                open_time = VALUES(open_time),
                                close_time = VALUES(close_time),
                                is_closed = VALUES(is_closed)`,
                            [id_restaurant, day, open_time, close_time, is_closed])
        }

        return {success:true, message:"Hours updated"}
    } catch(error){
        return {success:false, message: "Error updating hours"}
    }
}

// Get restaurant special days
const getRestaurantSpecialDays = async () => {
    try{
        const [special_days] = await pool.execute(`SELECT * FROM restaurant_special_days WHERE id_restaurant = ? ORDER BY day ASC`, [1]);
        
        return {success:true, special_days: special_days};
    } catch(error){
        return {success:false, message:"Special days getting failed", error:error}
    }
}

// Update special days
const updateRestaurantSpecialDays = async(special_days) => {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();
        for (const sp_day of special_days) {
            // Add new special day or update existed
            const query = `INSERT INTO restaurant_special_days (id_restaurant, day, is_closed, open_time, close_time)
                        VALUES (?, ?, ?, ?, ?)
                        ON DUPLICATE KEY UPDATE
                        is_closed = VALUES(is_closed),
                        open_time = VALUES(open_time),
                        close_time = VALUES(close_time)`;
            const values = [sp_day.id_rest,  sp_day.day, sp_day.is_closed, sp_day.open_time, sp_day.close_time];
            await connection.execute(query, values);
        }
        await connection.commit();
        return { success: true, message: "Special days added successfully" };
    } catch (error) {
        await connection.rollback();
        return { success: false, message: "Error adding special days", error };
    } finally {
        connection.release();
    }
}

// Delete special days
const deleteRestaurantSpecialDays = async(special_days) => {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();
        for (const sp_day of special_days) {
            // Add new special day or update existed
            const query = `DELETE FROM restaurant_special_days WHERE id_restaurant=? AND day=?`;
            const values = [sp_day.id_rest,  sp_day.day];
            await connection.execute(query, values);
        }
        await connection.commit();
        return { success: true, message: "Special days deleted successfully" };
    } catch (error) {
        await connection.rollback();
        return { success: false, message: "Error deleting special days", error };
    } finally {
        connection.release();
    }
}

// Update table data
const updateTableData = async (table) => {
    try {
        // Update table values
        await pool.execute(`UPDATE tables SET number=?, capacity=?, is_deleted=? WHERE id_table=?`, [table.number, table.capacity, table.is_deleted, table.id_table]);
        
        return {success:true, message:"Table updated successfully"};
    } catch(error) {
        return {success:false, message:"Table updating failed", error:error};
    }
}

// Get tables reservations from date
const getResersByTableAndDate = async (id_table, date) => {
    try {
        // List of tables reservations by date
        const [reservations] = await pool.execute(`SELECT * FROM reservation WHERE id_table = ? AND booking_start >= ?`, [id_table, date]);
        
        return {success: true, reservations: reservations}
    } catch (error) {
        return {success:false, message:"Error fetching table's reservations!", error:error};
    }
}

// Delete table from database
const deleteTableFromDB = async (id_table, number) => {
    try {
        const date = new Date().toISOString().replace("T", " "); // Now

        // List of tables reservations by date
        const [reservations] = await pool.execute(`SELECT * FROM reservation WHERE id_table = ? AND booking_start >= ?`, [id_table, date]);
        if (reservations.length != 0) return {success:false, message: `There are reservations on table ${number}(id:${id_table}) in the future!`};

        // Delete table (update tables data)
        await pool.execute(`UPDATE tables SET number = ?, is_deleted = ? WHERE id_table = ?`, [`del_${number}`, 1, id_table]);
        await pool.execute(`DELETE FROM restaurant_layout WHERE id_table = ?`, [id_table]);

        return {success: true, message: `The table ${number}(id:${id_table}) has been deleted`}
    } catch (error) {
        return {success:false, message:"Error deleting table", error:error};
    }
}

// analytics
const stats = async (startDate, endDate, tableNumber, clientName) => {
    try {
        

        let query = `SELECT r.booking_start, r.id_table, u.first_name, u.last_name
                        FROM reservation r LEFT JOIN users u ON r.id_user = u.id_user
                        WHERE 1=1`

        const params = []
        if (startDate) {
            query += ` AND r.booking_start >= ?`
            params.push(startDate)
        }
        if(endDate) {
            query += ` AND r.booking_start <= ?`
            params.push(endDate)
        }
        if(tableNumber){
            query += ` AND r.id_table = ?`
            params.push(tableNumber)
        }
        if(clientName){
            query += ` AND (u.first_name LIKE ? OR u.last_name LIKE ?)`;
            params.push(`%${encrypt(clientName)}%`, `%${encrypt(clientName)}%`);
        }

        console.log("query: ", query, params)

        const [stats] = await pool.execute(query, params)

        const decrypted = stats.map(row => ({
            ...row, first_name: decrypt(row.first_name), last_name: decrypt(row.last_name)
        }))
        return {success:true, message:"all good", stats: decrypted}
    } catch (error) {
        return {success:false, message:"Error fetching stats(admServ)", error:error}
    }
}

module.exports = {getServicesById, getReservationsByDate, approveReservation, deleteReservation, loadSchema, loadElements, saveElements, createRoom, updateRoomData, deleteRoomFromDB, getRestaurantHours, updateRestaurantHours, getRestaurantSpecialDays, updateRestaurantSpecialDays, deleteRestaurantSpecialDays, getResersByTableAndDate, deleteTableFromDB, updateTableData, stats};