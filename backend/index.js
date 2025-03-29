const express = require('express');
const mysql = require('mysql');
const path = require('path');
const bodyParser = require('body-parser');
const mysql2 = require('mysql2');

const cors = require('cors');
const { error } = require('console');
const { secureHeapUsed } = require('crypto');
const app = express();

const nodemailer = require('nodemailer');

// Database connection

const pool = mysql2.createConnection({
    host: 'restaurant2-table-reservation.mysql.database.azure.com',
    user: 'restaurant',
    password: 'HelloKitty!',
    database: 'table_reservation',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl: {
        rejectUnauthorized: true
    }
});

const promisePool = pool.promise();

//Body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());
// Serve static files from the React app
//app.use(express.static(path.join(__dirname, '../../frontend/tablereservation/build')));
// Handle all routes and serve React app
//app.get('*', (req, res) => {
//    res.sendFile(path.join(__dirname, '../../frontend/tablereservation/build'));
//});
// Handling customer data form submission from HomePge to User table in DB
app.post('/submit', async (req, res) => {
    const { firstname, lastname, phone, email } = req.body;

    if (phone.length > 15) {
        return res.status(400).send("Phone number cannot exceed 15 characters");
    }

    try {
        const [result] = await promisePool.execute(`
            INSERT INTO Users (first_name, last_name, phone, email, role) 
            VALUES (?, ?, ?, ?, ?)
        `, [firstname, lastname, phone, email, "client"]); // role == "client"


        res.send("New record inserted");
    } catch (err) {
        console.error("Error inserting data", err);
        res.status(500).send("Error inserting data");
    }
});

app.post('/getUserRole', async (req, res) => {
    const { email } = req.body;

    try {
        const [result] = await promisePool.execute(`
            SELECT role FROM Users WHERE email = ?
            `, [email]);

        if (result.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json({ role: result[0].role })
    } catch (error) {
        console.error("Error fetching user role: ", error);
        res.status(500).json({ error: "Error fetching user role" })
    }
});

app.post('/getUserParams', async (req, res) => {
    const { email } = req.body;

    try {
        const [result] = await promisePool.execute(`
            SELECT id_user, first_name, last_name, phone, role FROM Users WHERE email = ?
            `, [email]);

        if (result.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        //console.log(result)

        res.json({
            id_user: result[0].id_user,
            first_name: result[0].first_name,
            last_name: result[0].last_name,
            phone: result[0].phone,
            role: result[0].role
        })
    } catch (error) {
        console.error("Error fetching user role: ", error);
        res.status(500).json({ error: "Error fetching user role" })
    }
});

app.post('/getAvailableTables', async (req, res) => {
    const { date, time, capacity } = req.body;

    try {
        const bookingDateTime = `${date} ${time}:00`;

        const sql = `SELECT * FROM Tables 
            WHERE capacity >= ? 
            AND id_table NOT IN (
            SELECT id_table FROM Reservation 
            WHERE booking_start BETWEEN DATE_SUB(?, INTERVAL 2 HOUR) 
            AND DATE_ADD(?, INTERVAL 2 HOUR)
            )`

        const [tables] = await promisePool.execute(
            sql,
            [capacity, bookingDateTime, bookingDateTime]
        )

        res.json(tables);
    } catch (error) {
        res.status(500).json({ error: "Error fetching tables" })
    }
})

app.get('/getAdditionalServices', async (req, res) => {
    try {
        const [services] = await promisePool.execute(`
            SELECT id_additional_services, service_name, description, price 
            FROM additional_services
        `);
        res.json(services);
    } catch (error) {
        console.error("Error fetching additional services: ", error);
        res.status(500).json({ error: "Error fetching additional services" });
    }
});

app.post('/updateUser', async (req, res) => {
    const { firstname, lastname, phone, email } = req.body

    try {
        // обновляем
        const [result] = await promisePool.execute(`
            UPDATE Users 
            SET first_name = ?, last_name = ?, phone = ? 
            WHERE email = ?
        `, [firstname, lastname, phone, email]);


        res.json({ message: "Profile updated successfully" });
    } catch (err) {
        console.error("Error updating user profile:", err);
        res.status(500).json({ error: "Internal server error" });
    }
})




app.get('/users', async (req, res) => {
    try {

        const [result] = await promisePool.execute("SELECT * FROM Users");

        res.json(result);
    } catch (err) {
        console.error("Error fetching users", err);
        res.status(500).send("Error fetching users");
    }
});

/*
const PORT = 5002;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
*/

app.post('/addReservation', async (req, res) => {
    const { id_restaurant, id_table, id_user, date, time, duration, number_of_guests, additional_services } = req.body;

    const bookingDateTime = `${date} ${time}:00`;

    //console.log("body:", req.body);


    try {
        const sql = `INSERT INTO Reservation 
        (id_restaurant, id_table, id_user, booking_start, duration, confirmation, number_of_guests, additional_services) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
        
        const param = [
            Number(id_restaurant),
            Number(id_table),
            Number(id_user),
            bookingDateTime,
            Number(duration),
            0,
            Number(number_of_guests),
            additional_services,
        ]
        console.log(param)

        await promisePool.execute(sql, param);

        console.log("Reservation added successfully");
        res.json({ message: "Reservation added successfully" });

    } catch (error) {
        console.error("Error inserting reservation:", error);
        res.status(500).json({ error: "Error inserting reservation" });
    }
});

app.post('/getUserReservations', async (req, res) => {
    const { id_user } = req.body;

    if (!id_user) {
        return res.status(400).json({ error: "User ID is required" });
    }

    try {
        const sql = `
            SELECT id_reservation, id_table, booking_start, duration, number_of_guests, additional_services 
            FROM reservation
            WHERE id_user = ?
            ORDER BY booking_start DESC
        `;

        const [reservations] = await promisePool.execute(sql, [id_user]);

        res.json(reservations);
    } catch (error) {
        console.error("Error fetching reservations:", error);
        res.status(500).json({ error: "Error fetching reservations" });
    }
});


app.post('/getServicesById', async (req, res) => {
    const {servicesId} = req.body;

    if (!servicesId || servicesId.length === 0) {
        return res.json([])
    }

    try{

        const editedServices = servicesId.map(()=> "?").join(", ")

        servicesId = servicesId.split(",").map(Number);

        const sql = `SELECT * FROM additional_services
                    WHERE id_additional_services IN (${editedServices})`
        const [services] = await promisePool.execute(sql, servicesId)

        res.json(services)
    } catch (error) {
        console.error("Error fetching services", error);
        res.status(500).json({error: "Error fetching services"})
    }
})

app.post('/getReservationsByDate', async (req, res) => {
    const {date} = req.body;

    try{
        const sql = `SELECT * FROM reservation
                    WHERE DATE(booking_start) = ?`
        const [reservations] =await promisePool.execute(sql, [date]);
        console.log(reservations)
        res.json(reservations)
    } catch (error) {
        console.error("Error fetching reservations:", error);
        res.status(500).json({ error: "Error fetching reservations" });
    }
})


// Create a test Ethereal account for development
nodemailer.createTestAccount((err, testAccount) => {
    if (err) {
      console.error("Ошибка при создании тестового аккаунта:", err);
      return;
    }
    
    // Setting up a transporter using Ethereal
    const transporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });

  

app.post('/approveReservation', async (req, res) => {
    const {id} = req.body;
    //console.log("id reservation", id)
    //console.log("body:", req.body)

    try {
        const sql = `UPDATE reservation SET confirmation = 1
                    WHERE id_reservation = ?`
        await promisePool.execute(sql, [id]);

        
        // Receiving booking data and user information
        const selectSql = `SELECT r.*, u.email, u.first_name, u.last_name 
                            FROM reservation r
                            JOIN Users u ON r.id_user = u.id_user 
                            WHERE r.id_reservation = ?`;

        const [rows] = await promisePool.execute(selectSql, [id]);
    
        if (rows.length > 0) {
            const reservation = rows[0];

            // Content of e-mail confirmation letter for client
            const mailOptions = {
                from: '"Restaurant Reservations" <no-reply@example.com>',
                to: reservation.email,
                subject: 'Booking confirmation',
                html: `<p>Hello, ${reservation.first_name} ${reservation.last_name}!</p>
                       <p>Your booking has been confirmed.</p>
                       <p><strong>Date and time:</strong> ${reservation.booking_start}</p>
                       <p><strong>Number of guests:</strong> ${reservation.number_of_guests}</p>
                       <p>Thank you for choosing our restaurant!</p>`
            };

            // Sending a letter
            let info = await transporter.sendMail(mailOptions);
            console.log(`Notification email sent to ${reservation.email}`);
            console.log("Просмотр письма:", nodemailer.getTestMessageUrl(info));
          }

        res.json({ message: "Reservation approved and notification email sent" });


    } catch (error) {
        console.error("Error approving reservations:", error);
        res.status(500).json({ error: "Error approving reservations" });
    }
})
});

app.post('/deleteReservation', async (req, res) => {
    const {id} = req.body;


    try{
        const sql = `DELETE FROM reservation WHERE id_reservation = ?`;
        await promisePool.execute(sql, [id])
    } catch (error) {
        console.error("Error deleting reservation:", error);
        res.status(500).json({ error: "Error deleting reservation" });
    }
})

  
  const PORT = process.env.PORT || 5002;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
  