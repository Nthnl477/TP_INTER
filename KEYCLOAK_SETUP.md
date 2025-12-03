# Configuration Keycloak pour Epitanie

## Vue d'ensemble

Ce guide détaille la configuration de Keycloak pour la plateforme Epitanie.

## Prérequis

- Keycloak 24+ (local ou managed service)
- Admin access à Keycloak

## Configuration du Realm

### 1. Créer le Realm "epitanie"

1. Accéder à http://localhost:8080/admin (admin/password)
2. Cliquer sur "Master" → "Create realm"
3. Nommer : `epitanie`
4. Cliquer "Create"

### 2. Créer le Client "epitanie-app"

1. Aller dans Realm "epitanie"
2. Menu gauche → "Clients"
3. Cliquer "Create client"
4. Configurer :

| Paramètre | Valeur |
|-----------|--------|
| Client ID | epitanie-app |
| Name | Epitanie Application |
| Description | Plateforme de coordination ville-hôpital |
| Enabled | ON |
| Client authentication | ON |
| Authorization | ON |

5. Aller dans l'onglet "Access settings" :

| Paramètre | Valeur |
|-----------|--------|
| Root URL | http://localhost:3000 |
| Valid redirect URIs | http://localhost:3000/api/auth/callback |
| Valid post logout redirect URIs | http://localhost:3000 |
| Web origins | http://localhost:3000 |

6. Sauvegarder

### 3. Récupérer les secrets

1. Aller dans le client "epitanie-app"
2. Onglet "Credentials"
3. Copier le "Client secret"
4. L'ajouter à `.env.local` :

\`\`\`
KEYCLOAK_CLIENT_SECRET=<copier-secret-ici>
\`\`\`

### 4. Créer les rôles

1. Menu gauche → "Realm roles"
2. Cliquer "Create role"
3. Créer les 5 rôles :

- ROLE_ADMIN
- ROLE_SECRETARIAT
- ROLE_MEDECIN
- ROLE_INFIRMIER
- ROLE_PATIENT

### 5. Configurer les rôles au client

1. Aller dans le client "epitanie-app"
2. Onglet "Client scopes"
3. Cliquer "epitanie-app-dedicated" (ou le scope dédié)
4. Onglet "Scope" → "Assign role"
5. Ajouter les 5 rôles au client

Alternativement, ajouter un "Protocol Mapper" :

1. Onglet "Mappers"
2. "Create protocol mapper"
3. Type : "User Client Role"
4. Name : roles
5. Client ID : epitanie-app

### 6. Créer les utilisateurs de test

#### Utilisateur 1 : Admin

1. Menu gauche → "Users"
2. "Add user"
3. Username : `admin`
4. Email : `admin@epitanie.fr`
5. First name : Admin
6. Last name : Système
7. Email verified : ON
8. Enabled : ON
9. Créer

Ajouter le mot de passe :
1. Onglet "Credentials"
2. Set password : `password`
3. Temporary : OFF
4. Set password

Ajouter le rôle :
1. Onglet "Role mapping"
2. Assign role : `ROLE_ADMIN`

#### Utilisateur 2 : Secrétariat

Username : `secretariat`
Email : `secretariat@epitanie.fr`
Rôle : `ROLE_SECRETARIAT`

#### Utilisateur 3 : Médecin

Username : `medecin`
Email : `medecin@epitanie.fr`
Rôle : `ROLE_MEDECIN`

#### Utilisateur 4 : Infirmier

Username : `infirmier`
Email : `infirmier@epitanie.fr`
Rôle : `ROLE_INFIRMIER`

#### Utilisateur 5 : Patient

Username : `patient`
Email : `patient@epitanie.fr`
Rôle : `ROLE_PATIENT`

## Configuration du frontend

Ajouter à `.env.local` :

\`\`\`bash
# Public
NEXT_PUBLIC_KEYCLOAK_URL=http://localhost:8080
NEXT_PUBLIC_KEYCLOAK_REALM=epitanie
NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=epitanie-app
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Private
KEYCLOAK_AUTH_URL=http://localhost:8080
KEYCLOAK_REALM=epitanie
KEYCLOAK_CLIENT_ID=epitanie-app
KEYCLOAK_CLIENT_SECRET=<copier-secret-ici>
\`\`\`

## Configuration pour la production

### Vercel Deployment

1. **Ajouter les variables dans Vercel** :
   - Settings → Environment Variables
   - Ajouter toutes les variables ci-dessus
   - Remplacer `localhost` par les URLs de prod

2. **Keycloak en production** :
   - Utiliser un service managed (Keycloak Cloud, Auth0, etc.)
   - Ou déployer Keycloak sur serveur dédié
   - Configurer DNS et SSL/TLS

3. **Mise à jour redirects** :

Keycloak → Client settings :
- Root URL : `https://epitanie.example.com`
- Valid redirect URIs : `https://epitanie.example.com/api/auth/callback`
- Valid post logout : `https://epitanie.example.com`
- Web origins : `https://epitanie.example.com`

## Test de configuration

### 1. Vérifier la configuration

\`\`\`bash
curl -X POST http://localhost:8080/realms/epitanie/protocol/openid-connect/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "client_id=epitanie-app" \
  -d "client_secret=YOUR_SECRET" \
  -d "username=admin" \
  -d "password=password" \
  -d "grant_type=password"
\`\`\`

Vous devriez recevoir un JWT token.

### 2. Vérifier l'app

1. Lancer : \`npm run dev\`
2. Aller à http://localhost:3000
3. Cliquer "Se connecter avec Keycloak"
4. Se connecter avec : admin / password
5. Vérifier redirection vers dashboard admin

## Troubleshooting

### Token exchange failed

- Vérifier le secret dans `.env.local`
- Vérifier l'URL Keycloak
- Vérifier le realm et client ID

### Redirect URI mismatch

- Vérifier dans Keycloak : Client → Access Settings → Valid redirect URIs
- Doit correspondre à `{NEXT_PUBLIC_APP_URL}/api/auth/callback`

### Rôles non mappés

- Vérifier les rôles sont assignés à l'utilisateur
- Vérifier les rôles sont mapped au client scope
- Redémarrer Keycloak

### Utilisateurs non synchronisés

- Vérifier la connexion MongoDB
- Vérifier les logs de `/api/auth/callback`
- Vérifier la fonction `syncUserFromKeycloak`

## Ressources

- [Keycloak Official Docs](https://www.keycloak.org/documentation)
- [OpenID Connect](https://openid.net/connect/)
- [JWT.io](https://jwt.io/) - Pour tester les tokens
