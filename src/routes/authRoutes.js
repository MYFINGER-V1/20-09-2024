const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController'); 

// Ruta para manejar el inicio de sesión
router.post('/login', authController.loginUser);


module.exports = router;
