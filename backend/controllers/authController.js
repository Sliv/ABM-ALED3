const fs = require('fs');
const path = require('path');

const usersFilePath = path.join(__dirname, '../data/Usuarios.json');

// Función para cargar usuarios desde archivo JSON
const loadUsersFromFile = () => {
  try {
    const data = fs.readFileSync(usersFilePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error leyendo Usuarios.json:', err);
    return [];
  }
};

// Función para guardar usuarios en archivo JSON
const saveUsersToFile = (users) => {
  try {
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
    console.log('Usuarios guardados en archivo.');
  } catch (err) {
    console.error('Error guardando Usuarios.json:', err);
  }
};

exports.registerUser = (req, res) => {
  const { username, password } = req.body;
  
  const users = loadUsersFromFile();

  if (users.find(u => u.username === username)) {
    return res.status(400).json({ message: 'El usuario ya existe' });
  }

  const newUser = { username, password, rol: 'usuario' };
  users.push(newUser);
  saveUsersToFile(users);

  res.status(201).json({ message: 'Usuario registrado con éxito', user: newUser });
};

exports.loginUser = (req, res) => {
  const { username, password } = req.body;

  const users = loadUsersFromFile();

  const user = users.find(u => u.username === username && u.password === password);

  if (!user) {
    return res.status(401).json({ message: 'Credenciales inválidas' });
  }

  res.status(200).json({ message: 'Login exitoso', user: { username: user.username, rol: user.rol } });
};