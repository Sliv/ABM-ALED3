const fs = require('fs');
const path = require('path');

const rutaProductos = path.join(__dirname, '../data/Productos.json');

const cargarProductos = () => {
  try {
    const datos = fs.readFileSync(rutaProductos, 'utf8');
    return JSON.parse(datos);
  } catch (error) {
    console.error('Error al leer Productos.json:', error);
    return [];
  }
};

const guardarProductos = (productos) => {
  try {
    fs.writeFileSync(rutaProductos, JSON.stringify(productos, null, 2));
  } catch (error) {
    console.error('Error al guardar Productos.json:', error);
  }
};

exports.obtenerProductos = (req, res) => {
  const productos = cargarProductos();
  res.json(productos);
};

exports.agregarProducto = (req, res) => {
  const productos = cargarProductos();
  const nuevoProducto = req.body;

  nuevoProducto.id = productos.length
    ? Math.max(...productos.map(p => p.id)) + 1
    : 1;

  productos.push(nuevoProducto);
  guardarProductos(productos);

  res.status(201).json(nuevoProducto);
};

exports.actualizarProducto = (req, res) => {
  const id = parseInt(req.params.id);
  let productos = cargarProductos();

  const indice = productos.findIndex(p => p.id === id);
  if (indice === -1) {
    return res.status(404).json({ mensaje: 'Producto no encontrado' });
  }

  productos[indice] = { id, ...req.body };
  guardarProductos(productos);

  res.json(productos[indice]);
};

exports.eliminarProducto = (req, res) => {
  const id = parseInt(req.params.id);
  let productos = cargarProductos();

  productos = productos.filter(p => p.id !== id);
  guardarProductos(productos);

  res.json({ mensaje: 'Producto eliminado' });
};
