const users = []; // simulación en memoria

exports.registerUser = (req, res) => {
  const { username, password } = req.body;

  if (users.find(u => u.username === username)) {
    return res.status(400).json({ message: 'El usuario ya existe' });
  }

  users.push({ username, password });
  res.status(201).json({ message: 'Usuario registrado con éxito' });
};

exports.loginUser = (req, res) => {
  const { username, password } = req.body;

  const user = users.find(u => u.username === username && u.password === password);

  if (!user) {
    return res.status(401).json({ message: 'Credenciales inválidas' });
  }

  res.status(200).json({ message: 'Login exitoso', user: { username } });
};