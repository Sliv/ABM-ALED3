const express = require('express');
const router = express.Router();
const compraController = require('../controllers/compraController');

router.get('/:username', compraController.obtenerHistorialCompras);
router.post('/:username', compraController.agregarCompra);

module.exports = router;
