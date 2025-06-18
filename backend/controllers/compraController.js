const fs = require('fs');
const path = require('path');

const comprasFilePath = path.join(__dirname, '../data/Compras.json');

const loadCompras = () => {
  try {
    const data = fs.readFileSync(comprasFilePath, 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
  }
};

const saveCompras = (compras) => {
  fs.writeFileSync(comprasFilePath, JSON.stringify(compras, null, 2));
};

exports.getHistorialCompras = (req, res) => {
  const username = req.params.username;
  const compras = loadCompras();
  const comprasUsuario = compras.filter(c => c.username === username);
  res.json(comprasUsuario);
};

exports.agregarCompra = (req, res) => {
  const nuevaCompra = req.body;
  const username = req.params.username;

  nuevaCompra.username = username;
  if (!nuevaCompra.fecha) {
    nuevaCompra.fecha = new Date().toISOString();
  }

  const compras = loadCompras();
  compras.push(nuevaCompra);
  saveCompras(compras);
  res.status(201).json({ message: 'Compra guardada' });
};
