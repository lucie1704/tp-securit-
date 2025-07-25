const fs = require('fs');
const https = require('https');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const sanitize = require('mongo-sanitize');

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/tpdb';

mongoose.connect(MONGO_URL)
  .then(() => console.log('Connecté à MongoDB'))
  .catch(err => {
    console.error('Erreur de connexion MongoDB:', err.message);
    console.log('Assurez-vous que MongoDB est démarré ou utilisez: docker-compose up mongo');
  });

const User = mongoose.model('User', new mongoose.Schema({
  username: String,
  password: String
}));

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/login-vulnerable', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username, password }); 
  if (user) return res.send("Bienvenue !");
  res.status(401).send("Échec d'authentification");
});

app.post('/login-safe', async (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password || typeof username !== 'string' || typeof password !== 'string') {
    return res.status(401).send("Échec d'authentification");
  }
  
  const cleanData = sanitize({ username, password });
  
  if (!cleanData.username || !cleanData.password) {
    return res.status(401).send("Échec d'authentification");
  }
  
  const user = await User.findOne(cleanData);
  if (user) return res.send("Bienvenue !");
  res.status(401).send("Échec d'authentification");
});

app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  await User.create({ username, password });
  res.send("Utilisateur enregistré");
});

app.use(express.static(path.join(__dirname, 'frontend')));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/index.html'));
});

async function createDefaultUser() {
  try {
    const existingUser = await User.findOne({ username: 'admin' });
    if (!existingUser) {
      await User.create({ username: 'admin', password: 'admin123' });
      console.log('Utilisateur par défaut créé: admin/admin123');
    } else {
      console.log('Utilisateur par défaut existe déjà');
    }
  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur par défaut:', error);
  }
}

function startServer() {
  const certPath = path.join(__dirname, 'certs');
  const keyPath = path.join(certPath, 'localhost-key.pem');
  const certFilePath = path.join(certPath, 'localhost.pem');
  
  if (!fs.existsSync(keyPath) || !fs.existsSync(certFilePath)) {
    console.error('Certificats SSL manquants dans le dossier certs/');
    console.error('Générez-les avec: openssl req -x509 -newkey rsa:4096 -keyout certs/localhost-key.pem -out certs/localhost.pem -days 365 -nodes -subj "/C=FR/ST=IDF/L=Paris/O=Dev/CN=localhost"');
    process.exit(1);
  }
  
  const httpsOptions = {
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(certFilePath)
  };
  
  https.createServer(httpsOptions, app).listen(443, () => {
    console.log('Serveur HTTPS sur https://localhost');
    createDefaultUser();
  });
}

startServer();
