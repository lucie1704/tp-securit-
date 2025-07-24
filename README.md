# TP Sécurité Web – Application Express avec vulnérabilité NoSQL

## Membres du projet
- **Victor GRANDIN**
- **Lucie GODARD**

---

## 1. Objectif du TP

L'objectif de ce TP est de :

- Configurer un serveur HTTPS,
- Développer une application web volontairement vulnérable à une injection NoSQL,
- Implémenter une solution pour corriger cette vulnérabilité.
- Créer une interface web pour tester les vulnérabilités

---

## 2. Architecture du projet

### Frontend (Interface Web)
Le dossier `frontend/` contient une interface web moderne qui permet de :
- **Tester les injections NoSQL** de manière interactive
- **Comparer les versions vulnérable et sécurisée** côte à côte
- **Visualiser les résultats** en temps réel
- **Comprendre le principe** de l'attaque avec des explications détaillées

### Backend (API Express)
Le dossier `backend/` contient l'API Express qui expose :
- **POST /register** : enregistrement d'un nouvel utilisateur
- **POST /login-vulnerable** : version vulnérable à l'injection NoSQL
- **POST /login-safe** : version corrigée avec validation des types
- **GET /** : sert l'interface frontend

---

## 3. Configuration HTTPS en local

### Génération des certificats SSL

Pour le développement local, nous utilisons des certificats SSL auto-signés :

```bash
# Créer le dossier certs s'il n'existe pas
mkdir -p certs

# Générer les certificats SSL auto-signés
openssl req -x509 -newkey rsa:4096 -keyout certs/localhost-key.pem -out certs/localhost.pem -days 365 -nodes -subj "/C=FR/ST=IDF/L=Paris/O=Dev/CN=localhost"
```

**Note :** Les certificats auto-signés génèrent un avertissement de sécurité dans le navigateur. C'est normal pour le développement local.

---

## 4. Lancement du projet

### Option 1 : Docker Compose (Recommandé)
```bash
# Démarrer l'application complète
docker-compose up --build -d

# L'application est accessible sur :
# https://localhost
```

### Option 2 : Développement local
```bash
# Installer les dépendances
cd backend
npm install

# Démarrer MongoDB (si pas déjà fait)
docker-compose up mongo -d

# Démarrer le serveur backend
node index.js
```

---

## 5. Utilisation de l'interface web

### Accès à l'application
1. Ouvrir https://localhost dans votre navigateur
2. **Accepter l'avertissement de sécurité** (certificat auto-signé)
3. L'interface s'affiche avec deux panneaux de test

### Test via l'interface
1. **Utilisateur de test** : `admin` / `admin123` (créé automatiquement)
2. **Injection à tester** : `{"$ne": null}` dans les champs username et password
3. **Comparer les résultats** entre version vulnérable et sécurisée

---

## 6. Tests via API (Commandes curl)

### 1. Enregistrement d'un utilisateur
```bash
curl -k -X POST https://localhost/register \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin"}'
```

### 2. Connexion normale (fonctionne)
```bash
curl -k -X POST https://localhost/login-vulnerable \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin"}'
```

### 3. Injection NoSQL (connexion sans identifiants)
```bash
curl -k -X POST https://localhost/login-vulnerable \
  -H "Content-Type: application/json" \
  -d '{"username": {"$ne": null}, "password": {"$ne": null}}'
```

**Résultat :** Connexion acceptée même sans identifiants corrects.
=> L'application est vulnérable à une injection NoSQL.

### 4. Test sur la version sécurisée
```bash
curl -k -X POST https://localhost/login-safe \
  -H "Content-Type: application/json" \
  -d '{"username": {"$ne": null}, "password": {"$ne": null}}'
```

**Résultat :** "Format invalide"
=> L'injection est bloquée.

---

## 7. Principe de l'attaque NoSQL

### Vulnérabilité
L'injection exploite l'absence de validation des types d'entrée. Au lieu d'envoyer une string, on envoie un objet JSON contenant un opérateur MongoDB.

### Payload d'attaque
```json
{
  "username": {"$ne": null},
  "password": {"$ne": null}
}
```

### Explication
- `$ne` signifie "not equal"
- La condition `{"$ne": null}` retourne tous les utilisateurs dont le champ n'est pas null
- MongoDB trouve le premier utilisateur et accepte la connexion

### Remédiation
Dans la route `/login-safe`, une vérification des types a été ajoutée :
```javascript
if (typeof username !== 'string' || typeof password !== 'string') {
  return res.status(400).send("Format invalide");
}
```

---

## 8. Structure du projet

```
tp-securite/
├── backend/
│   ├── index.js          # Serveur Express + API
│   ├── package.json      # Dépendances Node.js
│   └── Dockerfile        # Configuration Docker
├── frontend/
│   └── index.html        # Interface web
├── certs/                # Certificats SSL (générés)
├── compose.yaml          # Configuration Docker Compose
└── README.md            # Ce fichier
```

---

## 9. Conclusion

Ce TP a permis de :

- ✅ Mettre en place un serveur HTTPS en local avec certificats auto-signés
- ✅ Créer une API Express connectée à MongoDB
- ✅ Développer une interface web interactive
- ✅ Illustrer une attaque par injection NoSQL
- ✅ Implémenter une protection basée sur la validation des entrées
- ✅ Comparer les versions vulnérable et sécurisée

L'interface web facilite la compréhension et le test des vulnérabilités, tandis que les commandes curl permettent des tests automatisés et une validation technique.