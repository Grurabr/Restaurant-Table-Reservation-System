const transporter = require('../config/nodemailer');
const RoomModel = require("../models/roomModel");
const SpecialDayModel = require('../models/special_day');
const TableModel = require('../models/tableModel');
require('dotenv').config();
const { getServicesById, getReservationsByDate, approveReservation, deleteReservation, loadSchema, loadElements, saveElements, createRoom, updateRoomData, getRestaurantHours, updateRestaurantHours, getResersByTableAndDate, deleteTableFromDB, updateTableData, deleteRoomFromDB, stats, updateRestaurantSpecialDays, getRestaurantSpecialDays, deleteRestaurantSpecialDays } = require("../services/adminService");
const { response } = require('express');



/*
// Declare transporter in module scope
let transporter;

// Create a test Ethereal account for development
nodemailer.createTestAccount((err, testAccount) => {
    if (err) {
      console.error("Error creating test account:", err);
      return;
    }
    
    // Setting up a transporter using Ethereal
    transporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
});
*/

// Get servers by id
const getSersById = async(req, res) => {
    const {servicesId} = req.body;

    if (!servicesId || servicesId.length === 0) {
        return res.json([])
    }

    try {
        const response = await getServicesById(servicesId);
        if(response.success) {
            return res.status(200).json(response.services)
        } else {
            return res.status(400).json(response)
        }
    } catch (error) {
        console.error("Error fetching services", error);
        return res.status(500).json({error: "Error fetching services"});
    }
}

// Get reservations by date
const getResByDate = async(req, res) => {
    const {date} = req.body;

    try {
        const response = await getReservationsByDate(date);
        if(response.success) {
            return res.status(200).json(response.reservations)
        } else {
            return res.status(400).json(response)
        }
    } catch (error) {
        console.error("Error fetching reservations: ", error);
        return res.status(500).json({error: "Error fetching reservations"});
    }
}

// Approve reservation
const approveRes = async(req, res) => {
    const {id} = req.body;

    try {
        const response = await approveReservation(id);
        if(response.success) {
            if (response.reservation) {
                const reservation = response.reservation;

                // Format date in finnish format
                const formattedDate = new Date(reservation.booking_start).toLocaleString('fi-FI', { 
                    year: 'numeric', month: '2-digit', day: '2-digit',
                    hour: '2-digit', minute: '2-digit'
                });
                // Content of e-mail confirmation letter for client
                const mailOptions = {
                    from: '"Restaurant Reservations" <dev.web.test.3@gmail.com>',
                    to: reservation.email,
                    subject: 'Booking confirmation',
                    html: `<p>Hello, ${reservation.first_name} ${reservation.last_name}!</p>
                            <p>Your booking with the booking ID: <strong>${reservation.id_reservation}</strong> has been confirmed.</p>
                            <p><strong>Date and time:</strong> ${formattedDate}</p>
                            <p><strong>Number of guests:</strong> ${reservation.number_of_guests}</p>
                            <p><strong>Table number:</strong> ${reservation.id_table}</p>
                            <p>We look forward to seeing you!</p>`
                };
                
                // Make sure the transporter is already created
                if (!transporter) {
                    console.error("Transporter is not initialized");
                    return res.status(500).json({ error: "Email transporter not initialized" });
                }

                // Sending a letter
                let info = await transporter.sendMail(mailOptions);
                console.log(`Admin confirmation email sent to ${reservation.email}`);
                //console.log("View letter:", nodemailer.getTestMessageUrl(info));
            }

            return res.status(200).json({ message: "Reservation approved and notification email sent" });
        } else {
            return res.status(400).json(response);
        }
    } catch (error) {
        console.error("Error approving reservations: ", error);
        return res.status(500).json({error: "Error approving reservations"});
    }
}

// Delete reservation
const deleteRes = async (req, res) => {
    const { id } = req.body;
    console.log('Received delete request for id:', id);
  
    try {
      const response = await deleteReservation(id);
      console.log('deleteReservation response:', response);
      if (response.success) {
        // If the deletion service (deleteReservation from adminService.js) returns the booking object, a notification is sent to the client by e-mail
        if (response.reservation) {
          const reservation = response.reservation;
          console.log('Reservation data for email notification:', reservation);

        // Format date in finnish format
        const formattedDate = new Date(reservation.booking_start).toLocaleString('fi-FI', { 
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit'
        });
          const mailOptions = {
            from: '"Restaurant Reservations" <dev.web.test.3@gmail.com>',
            to: reservation.email,
            subject: 'Booking cancelled by administrator',
            html: `<p>Hello, ${reservation.first_name} ${reservation.last_name}!</p>
                   <p>Your booking with the booking ID: <strong>${reservation.id_reservation}</strong>  scheduled for <strong>${formattedDate}</strong> has been cancelled by the administrator.</p>
                   <p>If you have any questions, please contact us.</p>`
          };
  
          // Checking that the mail transporter is initialized
          if (!transporter) {
            console.error("Transporter is not initialized");
            return res.status(500).json({ error: "Email transporter not initialized" });
          }
  
          try {
            let info = await transporter.sendMail(mailOptions);
            console.log(`Cancellation email sent to ${reservation.email}`);
          } catch (emailError) {
            console.error("Error sending cancellation email:", emailError);
            
          }
        }
        return res.status(200).json(response);
      } else {
        return res.status(400).json(response);
      }
    } catch (error) {
      console.error("Error deleting reservation: ", error);
      return res.status(500).json({ error: "Error deleting reservation" });
    }
  }
  

// Load restaurant schema
const loadFromSchema = async(req, res) => {
    try {
        const response = await loadSchema();
        if(response.success) {
            return res.status(200).json(response)
        } else {
            return res.status(400).json(response)
        }
    } catch (error) {
        return { success:false, message: 'Tables getting failed' }
    }
}

// Load schema elements
const loadDBElements = async(req, res) => {
    try {
        const response = await loadElements();
        if(response.success) {
            return res.status(200).json(response)
        } else {
            return res.status(400).json(response)
        }
    } catch (error) {
        return { success:false, message: 'Elements getting failed' }
    }
}

// Save restaurant schema
const saveSchema = async(req, res) => {
    const { layoutElements, addedTables } = req.body;

    try {
        const response = await saveElements(layoutElements, addedTables);
        if(response.success) {
            return res.status(200).json(response)
        } else {
            return res.status(400).json(response)
        }
    } catch (error) {
        return { success:false, message: 'Schema saving failed' }
    }
}

// Create new room
const addRoom = async(req, res) => {
    const { floor, name } = req.body;
    
    try {
        const response = await createRoom(Number(floor), name);
        if(response.success) {
            return res.status(200).json(response)
        } else {
            return res.status(400).json(response)
        }
    } catch (error) {
        return { success:false, message: 'Room creating failed' }
    }
}

// Update rooms data
const updateRoom = async(req, res) => {
    const { id_room, floor, name } = req.body;

    const room = new RoomModel({id_room, floor, name});

    try {
        const response = await updateRoomData(room);
        if(response.success) {
            return res.status(200).json(response)
        } else {
            return res.status(400).json(response)
        }
    } catch (error) {
        return { success:false, message: 'Room updating failed' }
    }
}

// Delete room
const deleteRoom = async(req, res) => {
    const { id_room} = req.body;

    try {
        const response = await deleteRoomFromDB(id_room);
        if(response.success) {
            return res.status(200).json(response)
        } else {
            return res.status(400).json(response)
        }
    } catch (error) {
        return { success:false, message: 'Room deleting failed' }
    }
}

// get rastoraunt hours
const getRestHours = async(req, res) => {
    //const id_restaurant = 1;
    //console.log("adminContr id_rest:", id_restaurant)

    try{
        //console.log("1")
        const response = await getRestaurantHours()
        //console.log("2")
        if(response.success) {
            //console.log("3")
            return res.status(200).json(response)
        } else {
            //console.log("4")
            return res.status(400).json(response)
        }
    } catch(error){
        return {success:false, message:"Hours getting failed"}
    }
}

//update hours
const updateRestHours = async(req, res) => {
    const {id_restaurant, hours} = req.body;

    //console.log("update hours, id and hours:", req.body)
    try{
        const response = await updateRestaurantHours(id_restaurant, hours)

        if(response.success){
            return res.status(200).json(response)
        } else {
            return res.status(400).json(response)
        }
    } catch (error){
        return {success:false, message:"Error updating hours"}
    }
}

// get rastoraunt special days
const getRestSpDays = async(req, res) => {
    try{
        const response = await getRestaurantSpecialDays();

        if(response.success) {
            return res.status(200).json(response)
        } else {
            return res.status(400).json(response)
        }
    } catch(error){
        return {success:false, message:"Special days getting failed"}
    }
}

//update special days
const updateRestSpDays = async(req, res) => {
    const {special_days} = req.body;
    const special_daysModels = special_days.map((sp_day) => new SpecialDayModel(sp_day));

    //console.log("update spec days:", special_daysModels);
    try{
        const response = await updateRestaurantSpecialDays(special_daysModels);

        if(response.success){
            return res.status(200).json(response)
        } else {
            return res.status(400).json(response)
        }
    } catch (error){
        return {success:false, message:"Error updating special days"}
    }
}

// delete special days
const deleteRestSpDays = async(req, res) => {
    const {special_days} = req.body;
    const special_daysModels = special_days.map((sp_day) => new SpecialDayModel(sp_day));

    //console.log("delete spec days:", special_daysModels);
    try{
        const response = await deleteRestaurantSpecialDays(special_daysModels);

        if(response.success){
            return res.status(200).json(response)
        } else {
            return res.status(400).json(response)
        }
    } catch (error){
        return {success:false, message:"Error deleting special days"}
    }
}

// Update tables data
const updateTable = async(req, res) => {
    const { id_table, id_restaurant, number, capacity, neighboring_tables, is_deleted } = req.body;

    const table = new TableModel({ id_table, id_restaurant, number, capacity, neighboring_tables, is_deleted });

    try {
        const response = await updateTableData(table);
        if(response.success) {
            return res.status(200).json(response)
        } else {
            return res.status(400).json(response)
        }
    } catch (error) {
        return { success:false, message: 'Table updating failed' }
    }
}

// Get tables reservations from date
const getResByTableAndDate = async(req, res) => {
    const {id_table, date} = req.body;

    try {
        const response = await getResersByTableAndDate(id_table, date);
        if(response.success) {
            return res.status(200).json(response.reservations)
        } else {
            return res.status(400).json(response)
        }
    } catch (error) {
        console.error("Error fetching table's reservations: ", error);
        return res.status(500).json({error: "Error fetching table's reservations"});
    }
}

// Delete table from Database
const deleteTable = async(req, res) => {
    const {id_table, number} = req.body;

    try {
        const response = await deleteTableFromDB(id_table, number);
        if(response.success) {
            return res.status(200).json(response.reservations)
        } else {
            return res.status(400).json(response)
        }
    } catch (error) {
        console.error("Error deleting table: ", error);
        return res.status(500).json({error: "Error deleting table"});
    }
}

// analytics
const searchStats = async(req, res) => {
    //console.log("Request:", req.body);
    const {startDate, endDate, tableNumber, clientName} = req.body

    try{
        const response = await stats(startDate, endDate, tableNumber, clientName)
        if(response.success){
            //console.log(response.stats)
            return res.status(200).json(response.stats)  
        } 
        else{
            //console.log(response)
            return res.status(400).json(response)
        } 
    } catch (error) {
        console.error("Error fetching stats:" , error)
        return res.status(500).json({error : "Error fetching stats"})
    }
}


module.exports = {getSersById, getResByDate, approveRes, deleteRes, loadFromSchema, loadDBElements, saveSchema, addRoom, updateRoom, deleteRoom, getRestHours, updateRestHours, getRestSpDays, updateRestSpDays, deleteRestSpDays, getResByTableAndDate, deleteTable, updateTable, searchStats};