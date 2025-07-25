# TP Sécurité Web – Serveur HTTPS & Injection NoSQL

## Membres du projet
- **Lucie GODARD**
- **Victor GRANDIN**

## Objectif

Démontrer une vulnérabilité d'injection NoSQL et implémenter une solution sécurisée avec :
- Serveur HTTPS avec certificats auto-signés
- API Express vulnérable et sécurisée
- Interface web interactive pour tester les attaques
- Base de données MongoDB

## Architecture

```
tp-securite/
├── backend/
│   ├── index.js          # API Express (vulnérable + sécurisée)
│   └── package.json      # Dépendances Node.js
├── frontend/
│   └── index.html        # Interface web de test
├── certs/                # Certificats SSL (à générer)
├── compose.yaml          # Configuration Docker
└── README.md
```

## Installation et lancement

### 1. Générer les certificats SSL
```bash
openssl req -x509 -newkey rsa:4096 -keyout certs/localhost-key.pem -out certs/localhost.pem -days 365 -nodes -subj "/C=FR/ST=IDF/L=Paris/O=Dev/CN=localhost"
```

### 2. Lancer avec Docker Compose
```bash
docker-compose up
```

L'application est accessible sur : **https://localhost**

## Vulnérabilité NoSQL

### Route vulnérable : `/login-vulnerable`
```javascript
const user = await User.findOne({ username, password });
```
**Problème** : Pas de validation des types d'entrée

### Route sécurisée : `/login-safe`
```javascript
const cleanData = sanitize({ username, password });

if (!cleanData.username || !cleanData.password) {
  return res.status(401).send("Échec d'authentification");
}
```
**Solution** : Sanitisation (retire les injections des données)

## Tests

### Utilisateur de test
- **Username** : `admin`
- **Password** : `admin123`

### Injection NoSQL
```bash
# Test vulnérabilité
curl -k -X POST https://localhost/login-vulnerable \
  -H "Content-Type: application/json" \
  -d '{"username": {"$ne": null}, "password": {"$ne": null}}'

# Test version sécurisée
curl -k -X POST https://localhost/login-safe \
  -H "Content-Type: application/json" \
  -d '{"username": {"$ne": null}, "password": {"$ne": null}}'
```

### Interface web
1. Ouvrir https://localhost
2. Accepter l'avertissement de sécurité causé par le certificat SSL auto signé (normal comme on est en local)
3. Tester les deux versions avec les identifiants utilisateur correctes et avec l'injection et comparer le résultat