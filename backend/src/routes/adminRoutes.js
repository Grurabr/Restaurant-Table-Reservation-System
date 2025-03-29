const express = require('express');
const { getSersById, getResByDate, approveRes, deleteRes, loadFromSchema, loadDBElements, saveSchema, addRoom, updateRoom, getRestHours, updateRestHours, getResByTableAndDate, deleteTable, updateTable, deleteRoom, searchStats, getRestSpDays, updateRestSpDays, deleteRestSpDays } = require('../controllers/adminController');
const router = express.Router();

// Reservation
router.post('/getServicesById', getSersById);
router.post('/getReservationsByDate', getResByDate);
router.post('/approveReservation', approveRes);
router.post('/deleteReservation', deleteRes);
// Schema
router.get('/load-schema', loadFromSchema);
router.get('/load-elements', loadDBElements);
router.post('/save-schema', saveSchema);
router.post('/create-room', addRoom);
router.post('/update-room', updateRoom);
router.post('/delete-room', deleteRoom);
router.post('/update-table', updateTable);
router.post('/get-reservations-by-table-date', getResByTableAndDate);
router.post('/delete-table', deleteTable);
// Work time
router.get('/getRestaurantHours', getRestHours);
router.put('/updateRestaurantHours', updateRestHours);
router.get('/get-special-days', getRestSpDays);
router.post('/update-special-days', updateRestSpDays);
router.post('/delete-special-days', deleteRestSpDays);
// Stats
router.post('/stats', searchStats);

module.exports = router;