const express = require('express');
const { register, getRole, getUser } = require('../controllers/authController');
const router = express.Router();

router.post('/submit', register);
router.post('/getUserRole', getRole);
router.post('/getUserParams', getUser);

module.exports = router;