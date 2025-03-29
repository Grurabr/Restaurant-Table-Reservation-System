// routes/userRoutes.js
const express = require('express');
const { getUsers, getTables, getServices, updateUser, addReservation, getReservations, deleteClientReservation, updateReservationHandler }= require('../controllers/userController.js');

const router = express.Router();

router.get('/users', getUsers);
router.post('/getAvailableTables', getTables);
router.get('/getAdditionalServices', getServices);
router.post('/updateUser', updateUser);
router.post('/addReservation', addReservation);
router.post('/getUserReservations', getReservations);
router.post('/deleteClientReservation', deleteClientReservation);
router.post('/updateReservation', updateReservationHandler);

module.exports = router;
