const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

router.get('/', productController.obtenerProductos);
router.post('/', productController.agregarProducto);
router.put('/:id', productController.actualizarProducto);
router.delete('/:id', productController.eliminarProducto);

module.exports = router;