const fs = require('fs');
const https = require('https');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/tpdb';
mongoose.connect(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });

const User = mongoose.model('User', new mongoose.Schema({
  username: String,
  password: String
}));

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 🔴 VULNÉRABLE : NoSQL injection possible ici
app.post('/login-vulnerable', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username, password }); // Pas de validation !
  if (user) return res.send("✅ Bienvenue !");
  res.status(401).send("❌ Échec d'authentification");
});

// ✅ REMÉDIATION
app.post('/login-safe', async (req, res) => {
  const { username, password } = req.body;

  // Vérification type (protège contre les injections objets)
  if (typeof username !== 'string' || typeof password !== 'string') {
    return res.status(400).send("Format invalide");
  }

  const user = await User.findOne({ username, password });
  if (user) return res.send("✅ Bienvenue (login sécurisé)");
  res.status(401).send("❌ Échec d'authentification");
});

app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  await User.create({ username, password });
  res.send("👤 Utilisateur enregistré");
});

const httpsOptions = {
  key: fs.readFileSync('/certs/localhost-key.pem'),
  cert: fs.readFileSync('/certs/localhost.pem')
};

https.createServer(httpsOptions, app).listen(443, () => {
  console.log('🚀 Serveur HTTPS sur https://localhost');
});
