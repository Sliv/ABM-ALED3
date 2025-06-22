const express = require('express');
const router = express.Router();
const { registrarUsuario, iniciarSesion } = require('../controllers/authController');

router.post('/sign-up', registrarUsuario);
router.post('/login', iniciarSesion);

module.exports = router;