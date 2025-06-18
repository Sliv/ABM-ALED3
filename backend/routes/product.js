const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

router.get('/', productController.getProductos);
router.post('/', productController.addProducto);
router.put('/:id', productController.updateProducto);
router.delete('/:id', productController.deleteProducto);

module.exports = router;