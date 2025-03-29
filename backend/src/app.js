// app.js
const express = require('express');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const userRoutes = require('./routes/userRoutes');
const reminder_emailRoutes = require('./routes/reminder_emailRoutes');
const { checkConnection } = require('./config/db');
const changeDB = require('./utils/dbUtils');
const cors = require('cors');

const app = express();
let port = 5002;
let hostname = "127.0.0.1";

app.use(cors());
app.use(express.json()); // Middleware to parse JSON bodies
//app.use('/api/users', userRoutes); // Use user routes for API calls
app.use('', authRoutes);
app.use('', userRoutes)
app.use('', adminRoutes);
app.use('', reminder_emailRoutes);

if (require.main === module) {
  app.listen(port, async () => {
    console.log(`Server running at http://${hostname}:${port}/`);
    try {
      await checkConnection();
      await changeDB();
    } catch (error) {
      console.log("Failed to initialize the database", error);
    }
  });
}

module.exports = app;