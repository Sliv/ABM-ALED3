const fs = require('fs');
const path = require('path');

const rutaUsuarios = path.join(__dirname, '../data/Usuarios.json');

const cargarUsuariosDesdeArchivo = () => {
  try {
    const datos = fs.readFileSync(rutaUsuarios, 'utf8');
    return JSON.parse(datos);
  } catch (error) {
    console.error('Error al leer Usuarios.json:', error);
    return [];
  }
};

const guardarUsuariosEnArchivo = (usuarios) => {
  try {
    fs.writeFileSync(rutaUsuarios, JSON.stringify(usuarios, null, 2));
    console.log('Usuarios guardados en el archivo.');
  } catch (error) {
    console.error('Error al guardar Usuarios.json:', error);
  }
};

exports.registrarUsuario = (req, res) => {
  const { username, password } = req.body;

  const usuarios = cargarUsuariosDesdeArchivo();

  if (usuarios.find(u => u.username === username)) {
    return res.status(400).json({ mensaje: 'El usuario ya existe' });
  }

  const nuevoUsuario = { username, password, rol: 'usuario' };
  usuarios.push(nuevoUsuario);
  guardarUsuariosEnArchivo(usuarios);

  res.status(201).json({ mensaje: 'Usuario registrado con éxito', usuario: nuevoUsuario });
};

exports.iniciarSesion = (req, res) => {
  const { username, password } = req.body;

  const usuarios = cargarUsuariosDesdeArchivo();

  const usuario = usuarios.find(u => u.username === username && u.password === password);

  if (!usuario) {
    return res.status(401).json({ mensaje: 'Credenciales inválidas' });
  }

  res.status(200).json({
    mensaje: 'Inicio de sesión exitoso',
    usuario: { username: usuario.username, rol: usuario.rol }
  });
};
