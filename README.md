# TP Sécurité Web – Application Express avec vulnérabilité NoSQL

## 1. Objectif du TP

L'objectif de ce TP est de :

- Configurer un serveur HTTPS,
- Développer une application web volontairement vulnérable à une injection NoSQL,
- Implémenter une solution pour corriger cette vulnérabilité.

---

## 2. Serveur HTTPS en local

### Pourquoi ne pas utiliser Let's Encrypt ?

Let's Encrypt nécessite un nom de domaine public et un serveur accessible depuis Internet pour vérifier la propriété du domaine.  
Dans le cadre de ce projet, tout est réalisé en local, sur `localhost`, sans nom de domaine. Il n’est donc pas possible d’utiliser Let’s Encrypt.

### Solution utilisée : mkcert

Pour générer un certificat HTTPS valide en local, j’ai utilisé `mkcert`.

Étapes réalisées :

```bash
# Installation (si non installé)
mkcert -install

# Génération des certificats pour localhost
mkcert -key-file certs/localhost-key.pem -cert-file certs/localhost.pem localhost
```

Les fichiers générés sont ensuite utilisés par le serveur Express via HTTPS dans Docker.

## 3. Lancement du projet
Le projet fonctionne avec Docker. Utiliser la commande suivante :

```bash
docker-compose up --build
```
L'application est ensuite accessible à l'adresse :
https://localhost

## 4. Application Express avec MongoDB
L'application utilise Express.js et MongoDB, et expose trois routes :

**POST /register** : enregistrement d’un nouvel utilisateur

**POST /login-vulnerable** : version vulnérable à une injection NoSQL

**POST /login-safe**: version corrigée

## 5. Démonstration de la vulnérabilité
### 1. Enregistrement d’un utilisateur

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

Résultat : Connexion acceptée même sans identifiants corrects.
=> L’application est vulnérable à une injection NoSQL.

## 6. Remédiation mise en place
Dans la route /login-safe, une vérification des types a été ajoutée pour éviter l'injection :

```js
if (typeof username !== 'string' || typeof password !== 'string') {
  return res.status(400).send("Format invalide");
}

const user = await User.findOne({ username, password });
```

Requête d'injection sur la route sécurisée

```bash
curl -k -X POST https://localhost/login-safe \
  -H "Content-Type: application/json" \
  -d '{"username": {"$ne": null}, "password": {"$ne": null}}'
```

Résultat : "Format invalide"
=> L’injection est bloquée.

## 7. Conclusion
Ce TP a permis de :

Mettre en place un serveur HTTPS en local avec mkcert,

Créer une API Express connectée à MongoDB,

Illustrer une attaque par injection NoSQL,

Implémenter une protection simple basée sur la validation des entrées.