const fs = require('fs');
const path = require('path');

const rutaCompras = path.join(__dirname, '../data/Compras.json');

const cargarCompras = () => {
  try {
    const datos = fs.readFileSync(rutaCompras, 'utf8');
    return JSON.parse(datos);
  } catch {
    return [];
  }
};

const guardarCompras = (compras) => {
  fs.writeFileSync(rutaCompras, JSON.stringify(compras, null, 2));
};

exports.obtenerHistorialCompras = (req, res) => {
  const nombreUsuario = req.params.username;
  const compras = cargarCompras();
  const comprasDelUsuario = compras.filter(c => c.username === nombreUsuario);
  res.json(comprasDelUsuario);
};

exports.agregarCompra = (req, res) => {
  const nuevaCompra = req.body;
  const nombreUsuario = req.params.username;

  nuevaCompra.username = nombreUsuario;
  if (!nuevaCompra.fecha) {
    nuevaCompra.fecha = new Date().toISOString();
  }

  const compras = cargarCompras();
  compras.push(nuevaCompra);
  guardarCompras(compras);
  res.status(201).json({ mensaje: 'Compra guardada exitosamente' });
};
