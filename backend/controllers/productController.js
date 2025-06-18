const fs = require('fs');
const path = require('path');

const productosPath = path.join(__dirname, '../data/Productos.json');

const loadProductos = () => {
  try {
    const data = fs.readFileSync(productosPath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error al leer Productos.json:', err);
    return [];
  }
};

const saveProductos = (productos) => {
  try {
    fs.writeFileSync(productosPath, JSON.stringify(productos, null, 2));
  } catch (err) {
    console.error('Error al guardar Productos.json:', err);
  }
};

exports.getProductos = (req, res) => {
  const productos = loadProductos();
  res.json(productos);
};

exports.addProducto = (req, res) => {
  const productos = loadProductos();
  const nuevoProducto = req.body;
  nuevoProducto.id = productos.length ? Math.max(...productos.map(p => p.id)) + 1 : 1;
  productos.push(nuevoProducto);
  saveProductos(productos);
  res.status(201).json(nuevoProducto);
};

exports.updateProducto = (req, res) => {
  const id = parseInt(req.params.id);
  let productos = loadProductos();
  const index = productos.findIndex(p => p.id === id);
  if (index === -1) return res.status(404).json({ message: 'Producto no encontrado' });

  productos[index] = { id, ...req.body };
  saveProductos(productos);
  res.json(productos[index]);
};

exports.deleteProducto = (req, res) => {
  const id = parseInt(req.params.id);
  let productos = loadProductos();
  productos = productos.filter(p => p.id !== id);
  saveProductos(productos);
  res.json({ message: 'Producto eliminado' });
};
