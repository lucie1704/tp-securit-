# TP Sécurité Web – Serveur HTTPS & Injection NoSQL

## Membres du projet
- **Lucie GODARD**
- **Victor GRANDIN**

## Objectif

Démontrer une vulnérabilité d'injection NoSQL et implémenter une solution sécurisée avec :
- Serveur HTTPS avec Caddy (auto-certificats)
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
├── Caddyfile             # Configuration Caddy (HTTPS + sécurité)
├── compose.yaml          # Configuration Docker
└── README.md
```

## Installation et lancement

### 1. Lancer avec Docker Compose
```bash
docker-compose up
```

L'application est accessible sur : **https://localhost:3000**

**Note** : Caddy génère automatiquement les certificats SSL auto-signés pour le développement local.

## Configuration Caddy

### Développement local
Le `Caddyfile` est configuré pour :
- **HTTPS automatique** avec certificats auto-signés
- **Rate limiting** : 5 requêtes/minute sur les routes `/login*`
- **Headers de sécurité** : HSTS, X-Content-Type-Options, X-Frame-Options, X-XSS-Protection
- **Reverse proxy** vers l'app sur le port 3000

### Production
Pour déployer en production :
1. Décommentez la section production dans `Caddyfile`
2. Remplacez `votre-domaine.com` par votre vrai domaine
3. Caddy générera automatiquement des certificats Let's Encrypt

## Vulnérabilité NoSQL

### Route vulnérable : `/login-vulnerable`
```javascript
const user = await User.findOne({ username, password });
```
**Problème** : Pas de validation des types d'entrée

### Route sécurisée : `/login-safe`
```javascript
const cleanData = sanitize({ username, password });
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