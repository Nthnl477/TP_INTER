# Guide de développement - Epitanie

## Démarrage local

### 1. Prérequis

- Node.js 18+
- MongoDB 6+
- Keycloak 24+
- Git
- Code editor (VS Code recommandé)

### 2. Cloner et installer

\`\`\`bash
git clone <repo-url>
cd epitanie
npm install
\`\`\`

### 3. Lancer les services (Docker)

**MongoDB** :
\`\`\`bash
docker run -d \
  --name mongodb \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=root \
  -e MONGO_INITDB_ROOT_PASSWORD=password \
  mongo:7
\`\`\`

**Keycloak** :
\`\`\`bash
docker run -d \
  --name keycloak \
  -p 8080:8080 \
  -e KC_BOOTSTRAP_ADMIN_USERNAME=admin \
  -e KC_BOOTSTRAP_ADMIN_PASSWORD=password \
  quay.io/keycloak/keycloak:24.0 \
  start-dev
\`\`\`

### 4. Configurer les variables

Copier `.env.local.example` → `.env.local` :

\`\`\`bash
cp .env.local.example .env.local
\`\`\`

Éditer et remplacer les valeurs.

### 5. Lancer l'app

\`\`\`bash
npm run dev
\`\`\`

App disponible sur http://localhost:3000

## Structure du code

### Naming conventions

- Fichiers React : `kebab-case.tsx`
- Fichiers TypeScript : `kebab-case.ts`
- Répertoires : `kebab-case`
- Variables/functions : `camelCase`
- Classes/Types/Interfaces : `PascalCase`
- Constantes : `UPPER_SNAKE_CASE`

### Composants

Toujours créer des composants séparés pour :
- Pages (`app/*/page.tsx`)
- Layouts (`components/*-layout.tsx`)
- Listes/Tables (`components/*/list.tsx`)
- Formulaires (`components/*/form.tsx`)
- Cards/Items (`components/*/card.tsx`)

### Types

Toujours créer des types/interfaces :

\`\`\`typescript
// ✅ Bon
interface UserData {
  userId: string;
  email: string;
  role: UserRole;
}

// ❌ Mauvais
const getUserData = (user: any): any => { ... }
\`\`\`

### API Routes

Tous les endpoints doivent :
1. Vérifier l'authentification avec `requireAuth()`
2. Inclure la gestion d'erreur avec `try/catch`
3. Retourner des réponses structurées avec `successResponse()` ou `handleApiError()`

\`\`\`typescript
// ✅ Bon
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth();
    const data = await fetchData();
    return successResponse(data);
  } catch (error) {
    return handleApiError(error);
  }
}

// ❌ Mauvais
export async function GET(request: NextRequest) {
  const data = await fetchData();
  return NextResponse.json(data);
}
\`\`\`

## Développement local

### Lancer sans Keycloak (mock auth)

Pour tester sans Keycloak, créer un mock auth handler :

1. Créer `lib/keycloak/mock.ts`
2. Implémenter les fonctions avec des données de test
3. Importer le mock dans `middleware.ts` en dev

### Déboguer les requêtes API

Ajouter des logs détaillés :

\`\`\`typescript
console.log('[v0] Auth context:', auth);
console.log('[v0] Patient access check:', canAccess);
console.log('[v0] Database query:', result);
\`\`\`

### Vérifier les tokens

Utiliser [jwt.io](https://jwt.io/) pour décoder les tokens JWT et vérifier les claims.

## Ajouter une nouvelle fonctionnalité

### Exemple : Créer un nouveau endpoint

1. **Créer le model** (si nécessaire) : `lib/db/models/NewEntity.ts`
2. **Créer l'endpoint** : `app/api/new-entities/route.ts`
3. **Ajouter les tests** d'autorisation
4. **Créer le composant** : `components/new-entities/list.tsx`
5. **Ajouter la page** : `app/dashboard/*/new-entities/page.tsx`

### Checklist

- [ ] Types TypeScript définis
- [ ] Model MongoDB créé
- [ ] Tests d'autorisation inclus
- [ ] Gestion d'erreur complète
- [ ] Validation des inputs
- [ ] Composants React créés
- [ ] Documentation mise à jour

## Tests

### Tests manuels

1. Tester avec chaque rôle (admin, secretary, doctor, patient)
2. Vérifier les permissions (ne pas accéder aux données d'autres)
3. Vérifier les formulaires (valeurs valides et invalides)
4. Tester sur mobile (responsive)

### Logs de debug

Utiliser `[v0]` prefix dans les logs pour les tracer facilement :

\`\`\`bash
npm run dev | grep "[v0]"
\`\`\`

## Performance

### Optimisations principales

- Lazy loading des composants : `dynamic(() => import(...))`
- Pagination sur les listes longues
- Caching des données : utiliser SWR
- Images optimisées : `next/image`

### Monitoring

- Vérifier les logs Vercel
- Utiliser Web Vitals
- Profiler les requêtes API

## Déploiement

### Avant de déployer

\`\`\`bash
# Build local
npm run build

# Tester la build
npm run start

# Linter
npm run lint
\`\`\`

### Déployer sur Vercel

\`\`\`bash
# Depuis GitHub
# 1. Push les changements
# 2. Créer une PR
# 3. Vérifier le preview
# 4. Merger sur main
# 5. Vercel déploie automatiquement
\`\`\`

### Variables de production

Ajouter dans Vercel :
- MONGODB_URI (production DB)
- KEYCLOAK_* (production Keycloak)
- NEXT_PUBLIC_* (public vars)

## Ressources

- [Next.js Docs](https://nextjs.org/docs)
- [TypeScript](https://www.typescriptlang.org/docs/)
- [MongoDB](https://docs.mongodb.com/)
- [Keycloak](https://www.keycloak.org/documentation)
- [Tailwind CSS](https://tailwindcss.com/docs)
