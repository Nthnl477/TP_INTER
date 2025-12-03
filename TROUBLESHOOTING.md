# Troubleshooting - Epitanie

## Authentification

### "Invalid redirect URI"

**Cause** : La redirect URI dans Keycloak ne correspond pas

**Solution** :
1. Vérifier dans Keycloak : Client → Access Settings
2. Ajouter `{NEXT_PUBLIC_APP_URL}/api/auth/callback`
3. Redémarrer l'app

### "Failed to exchange code for token"

**Cause** : Secret incorrect ou Keycloak inaccessible

**Solution** :
1. Vérifier `KEYCLOAK_CLIENT_SECRET` dans `.env.local`
2. Vérifier `KEYCLOAK_AUTH_URL`
3. Vérifier que Keycloak tourne : `curl http://localhost:8080`

## MongoDB

### "MongoError: connect ECONNREFUSED"

**Cause** : MongoDB n'est pas en cours d'exécution

**Solution** :
\`\`\`bash
# Relancer MongoDB
docker restart mongodb

# Ou vérifier le status
docker ps | grep mongodb
\`\`\`

### "E11000 duplicate key error"

**Cause** : Tentative d'insertion d'une clé unique existante

**Solution** :
\`\`\`bash
# Vider la DB
docker exec mongodb mongo -u root -p password --eval "db.dropDatabase()"

# Redémarrer
npm run dev
\`\`\`

## API

### "401 Unauthorized"

**Cause** : Token manquant ou expiré

**Solution** :
1. Se reconnecter
2. Vérifier le cookie `access_token`
3. Vérifier la durée d'expiration du token

### "403 Forbidden"

**Cause** : Rôle insuffisant ou pas dans le cercle de soins

**Solution** :
1. Vérifier le rôle de l'utilisateur dans Keycloak
2. Vérifier que le patient est dans le cercle de soins du professionnel

### "500 Internal Server Error"

**Cause** : Erreur serveur

**Solution** :
1. Vérifier les logs Next.js : `npm run dev` output
2. Chercher `[v0]` dans les logs
3. Vérifier la connexion MongoDB et Keycloak

## Frontend

### "Page blanche"

**Cause** : Erreur React non affichée

**Solution** :
1. Ouvrir DevTools (F12)
2. Console → vérifier les erreurs
3. Vérifier `npm run dev` output

### "Boutons ne réagissent pas"

**Cause** : Middleware redirige vers login

**Solution** :
1. Vérifier l'authentification
2. Vérifier la route est protégée
3. Se reconnecter

## Déploiement

### "Build fails on Vercel"

**Solution** :
1. Vérifier les types TypeScript : `npx tsc --noEmit`
2. Vérifier les dépendances manquantes
3. Vérifier les variables d'environnement

### "Environment variables not found"

**Solution** :
1. Vercel Settings → Environment Variables
2. Ajouter toutes les variables de `.env.local.example`
3. Re-déployer

## Performance

### "API lente"

**Solution** :
1. Vérifier les requêtes : use DevTools Network tab
2. Ajouter des indexes MongoDB si nécessaire
3. Implémenter du caching avec SWR

### "Page lente au chargement"

**Solution** :
1. Vérifier la taille du bundle : `npm run build`
2. Utiliser dynamic imports pour lazy loading
3. Optimiser les images avec `next/image`

## Autres

### "Les utilisateurs ne se synchronisent pas"

**Cause** : `/api/auth/callback` ne s'exécute pas

**Solution** :
1. Vérifier que `syncUserFromKeycloak` est appelé
2. Vérifier la connexion MongoDB
3. Vérifier les logs : `console.log('[v0] User sync...')`

### "Messages non reçus"

**Cause** : Destinataires pas synchronisés

**Solution** :
1. Vérifier que tous les utilisateurs existent en MongoDB
2. Vérifier la requête POST /api/messages
3. Vérifier les ObjectIds sont valides

---

**Pour plus d'aide**, ouvrir une issue sur GitHub ou consulter la documentation Keycloak/MongoDB.
