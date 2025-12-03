# Architecture - Plateforme Epitanie

## Vue d'ensemble

Epitanie est une plateforme de coordination ville-hôpital (PoC académique) construite avec Next.js 16, TypeScript, MongoDB et Keycloak.

## Structure du projet

\`\`\`
epitanie/
├── app/
│   ├── api/                    # Route handlers REST
│   │   ├── auth/              # Authentification & callbacks
│   │   ├── patients/          # CRUD patients
│   │   ├── rendezvous/        # CRUD rendez-vous
│   │   ├── documents/         # CRUD documents cliniques
│   │   ├── analyses/          # CRUD analyses biologiques
│   │   └── messages/          # CRUD messages internes
│   ├── dashboard/             # Pages protégées
│   │   ├── page.tsx           # Router vers dashboards
│   │   ├── admin/             # Dashboard admin
│   │   ├── secretariat/       # Dashboard secrétariat
│   │   ├── professionnel/     # Dashboard professionnel
│   │   └── patient/           # Dashboard patient
│   ├── layout.tsx             # Layout principal
│   ├── page.tsx               # Accueil
│   ├── login/                 # Page login Keycloak
│   └── logout/                # Page déconnexion
├── components/
│   ├── ui/                    # Composants shadcn/ui
│   ├── dashboard-layout.tsx   # Layout commun dashboards
│   ├── admin/                 # Composants admin
│   ├── secretariat/           # Composants secrétariat
│   ├── professional/          # Composants professionnel
│   └── patient/               # Composants patient
├── lib/
│   ├── db/
│   │   ├── connection.ts      # Connexion MongoDB
│   │   ├── models/            # Schemas Mongoose (8 modèles)
│   │   └── sync-user.ts       # Sync user Keycloak → MongoDB
│   ├── keycloak/
│   │   ├── token.ts           # Utilitaires JWT
│   │   ├── auth.ts            # OIDC flow
│   │   └── auth-context.ts    # Context serveur
│   ├── api/
│   │   ├── authorization.ts   # RBAC & cercle de soins
│   │   └── error-handler.ts   # Gestion erreurs API
│   ├── types/
│   │   ├── keycloak.ts        # Types Keycloak/JWT
│   │   └── api.ts             # Types API
│   └── utils.ts               # Utilitaires (formatting, etc.)
├── middleware.ts              # Middleware Next.js (protection routes)
├── next.config.mjs            # Config Next.js
├── tsconfig.json              # Config TypeScript
├── package.json               # Dépendances
├── .env.local.example         # Variables d'environnement
├── README.md                  # Démarrage rapide
├── ARCHITECTURE.md            # Ce fichier
└── KEYCLOAK_SETUP.md          # Configuration détaillée Keycloak
\`\`\`

## Flux de données

### 1. Authentification (Keycloak OIDC)

\`\`\`
Utilisateur
    ↓
1. Clic "Se connecter"
    ↓
2. Redirect → Keycloak
    ↓
3. Saisir credentials
    ↓
4. Keycloak retourne le code
    ↓
5. /api/auth/callback → échange code pour token JWT
    ↓
6. Sync user MongoDB (createOrUpdate)
    ↓
7. Set cookie access_token (httpOnly)
    ↓
8. Redirect → /dashboard
\`\`\`

### 2. Autorisation (RBAC + Cercle de soins)

\`\`\`
Requête API
    ↓
middleware.ts vérifie JWT
    ↓
Endpoint API :
  - Extract auth context (keycloakId, roles)
  - Vérifier rôle + permissions (isAdmin, isSecretary, etc.)
  - Pour les professionnels : vérifier cercle de soins
  - Pour les patients : vérifier ownership
    ↓
Accès autorisé → retourner données
Accès refusé → 403 Forbidden
\`\`\`

## Modèles de données

### Schémas MongoDB (8 entités)

1. **User** - Utilisateur Keycloak synchronisé
2. **Patient** - Dossier patient avec cercle de soins
3. **ProfessionnelDeSante** - Médecin/Infirmier
4. **Etablissement** - Hôpital/Cabinet/Laboratoire
5. **RendezVous** - Consultation planifiée
6. **DocumentClinique** - Compte-rendu/Courrier/Imagerie
7. **AnalyseBiologique** - Résultats d'analyses
8. **MessageInterne** - Communication intra-plateforme

### Relations principales

\`\`\`
User 1─────∞ Patient
     ├─────∞ ProfessionnelDeSante
     └─────∞ DocumentClinique

Patient 1─────∞ RendezVous
        ├─────∞ DocumentClinique
        ├─────∞ AnalyseBiologique
        └─────∞ MessageInterne

ProfessionnelDeSante ∞─────1 Etablissement
\`\`\`

## API REST

### Endpoints protégés

| Route | Méthode | Rôles | Description |
|-------|---------|-------|-------------|
| `/api/patients` | GET | ADMIN, SECRETARIAT, PROFESSIONNEL | Lister patients |
| `/api/patients` | POST | ADMIN, SECRETARIAT | Créer patient |
| `/api/patients/[id]` | GET | ADMIN, SECRETARIAT, PROFESSIONNEL, PATIENT | Détail patient |
| `/api/patients/[id]` | PATCH | ADMIN, SECRETARIAT, PATIENT | Modifier patient |
| `/api/rendezvous` | GET | Tous | Lister rendez-vous (filtrés) |
| `/api/rendezvous` | POST | ADMIN, SECRETARIAT, PROFESSIONNEL | Créer rendez-vous |
| `/api/rendezvous/[id]` | PATCH | ADMIN, SECRETARIAT, PROFESSIONNEL | Modifier statut |
| `/api/documents` | GET | ADMIN, PROFESSIONNEL, SECRETARIAT, PATIENT | Lister documents |
| `/api/documents` | POST | PROFESSIONNEL, ADMIN | Créer document |
| `/api/analyses` | GET | ADMIN, PROFESSIONNEL, PATIENT | Lister analyses |
| `/api/analyses` | POST | PROFESSIONNEL, ADMIN | Prescrire analyse |
| `/api/messages` | GET | Tous | Lister messages |
| `/api/messages` | POST | Tous | Envoyer message |

### Rules d'autorisation

#### Admin
- Accès complet à toutes les données
- Gestion des utilisateurs (Keycloak)
- Gestion des établissements et professionnels

#### Secrétariat
- CRUD complet rendez-vous
- Accès lecture patients
- Accès lecture documents et analyses

#### Professionnel (Médecin/Infirmier)
- Voir uniquement patients du cercle de soins
- Créer documents cliniques (pour ses patients)
- Prescrire analyses (pour ses patients)
- Voir ses rendez-vous

#### Patient
- Voir uniquement ses données
- Voir ses rendez-vous
- Voir ses documents
- Voir ses résultats d'analyses
- Envoyer/recevoir messages

## Sécurité

### 1. Authentification
- OIDC via Keycloak
- JWT tokens signés
- HttpOnly cookies (pas accessible JS)

### 2. Authorization
- RBAC (roles dans Keycloak)
- ACL (access control list) pour cercle de soins
- Vérification middleware sur `/dashboard/*` et `/api/*`

### 3. Validation
- Validation des inputs sur tous les endpoints
- Type-safe avec TypeScript
- Schémas MongoDB validés

### 4. Données
- Pas de données sensibles en logs
- CORS configuré au besoin
- Validation rôle à chaque accès ressource

## Rôles et habilitations

### ROLE_ADMIN
- Tout manager
- Accès console admin

### ROLE_SECRETARIAT
- Calendrier rendez-vous
- Gestion patients (créer, modifier)
- Documents en lecture seule

### ROLE_MEDECIN / ROLE_INFIRMIER
- Mes patients (cercle de soins)
- Créer documents cliniques
- Prescrire analyses
- Voir rendez-vous

### ROLE_PATIENT
- Mon dossier (lecture seule sauf coordonnées)
- Mes rendez-vous
- Mes documents
- Mes résultats
- Messagerie interne

## Processus de déploiement

### Développement local
1. Lancer MongoDB (Docker)
2. Lancer Keycloak (Docker)
3. \`npm install\` + \`npm run dev\`

### Production (Vercel)
1. Connecter repo GitHub
2. Ajouter variables d'environnement
3. Déployer automatiquement
4. Keycloak externe (managed service)
5. MongoDB externe (Vercel KV ou Atlas)

## Extensions futures

- Stockage fichiers (Vercel Blob)
- Notifications (email, SMS)
- Signature électronique
- Export PDF
- Intégration FHIR
- Calendrier interactif
- Chat temps réel

## Troubleshooting

Voir `KEYCLOAK_SETUP.md` et section troubleshooting du README.

---

**Dernière mise à jour**: Décembre 2025 | **Version**: 0.1.0
