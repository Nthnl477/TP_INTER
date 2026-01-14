# Plateforme de Coordination Ville-Hôpital - Epitanie

## Vue d'ensemble

Epitanie est une plateforme full-stack de coordination entre professionnels de santé (médecins, infirmiers, secrétariats) et patients pour la gestion centralisée de dossiers médicaux, rendez-vous et analyses biologiques.

### Stack technique

- **Frontend/Backend**: Next.js 16+ (App Router) avec TypeScript
- **UI**: Tailwind CSS + composants shadcn/ui
- **Base de données**: MongoDB avec Mongoose
- **Authentification**: Keycloak (OIDC) avec RBAC
- **Déploiement**: Vercel-ready

## Architecture

\`\`\`
epitanie/
├── app/
│   ├── api/              # Route handlers API
│   ├── dashboard/        # Pages protégées
│   ├── layout.tsx        # Layout principal
│   └── page.tsx          # Accueil
├── lib/
│   ├── db/
│   │   ├── connection.ts # Connexion MongoDB
│   │   └── models/       # Schemas Mongoose
│   ├── types/            # Types TypeScript
│   └── keycloak.ts       # Utilitaires Keycloak
├── components/           # Composants React
└── public/               # Assets statiques
\`\`\`

## Modèles de données

### Entités principales

1. **User** - Utilisateur Keycloak synchronisé en base
2. **Patient** - Dossier patient avec cercle de soins
3. **ProfessionnelDeSante** - Médecin ou Infirmier
4. **Etablissement** - Hôpital, cabinet, laboratoire
5. **RendezVous** - Consultation planifiée
6. **DocumentClinique** - Compte-rendu, courrier, imagerie
7. **AnalyseBiologique** - Résultats d'analyses
8. **MessageInterne** - Communication interne

### Alignement MOS/NOS (sous-ensemble ANS)

- **MOS (modèle)** : Nous modélisons un noyau commun des objets de santé : patient + cercle de soins, professionnels (médecin/infirmier) liés à un établissement, établissements (hôpital, cabinet, laboratoire), rendez-vous, documents cliniques et analyses biologiques.
- **NOS (nomenclature)** : Les établissements portent un `codeNOS` optionnel (affiché côté admin et utilisé pour identifier les laboratoires dans les analyses). Les documents cliniques embarquent `codesNOSOuAutres` pour référencer des terminologies (ex. codes NOS, CIM-10). Les libellés de type (type d’établissement, statut d’analyse, type de document) sont aujourd’hui des énumérations locales et non des JDV/TRE officiels.
- **Portée limitée** : Pas d’URI de JDV/TRE, pas de versioning NOS ni de navigation SMT ; les libellés de statuts (rendez-vous, analyses) et types de documents ne sont pas alignés sur des jeux de valeurs ANS. Ce POC se limite à exposer le code NOS des établissements et à permettre le stockage de codes terminologiques sur les documents.

### Webservice FHIR (POC TD2)

- Endpoint : `GET /api/fhir/analyses` retourne un Bundle FHIR (type `collection`) contenant pour chaque analyse :
  - `ServiceRequest` (prescription) avec références vers `Patient`, `Practitioner` (prescripteur) et `Organization` (labo, `identifier` NOS si connu).
  - `DiagnosticReport` (bilan) lié à la prescription et aux résultats.
  - `Observation` (une par examen saisi, ex. TSH/T3/T4 libres) avec statut préliminaire ou final selon l’analyse.
- Deduplication : chaque ressource est unique dans le Bundle (Patient, Practitioner, Organization réutilisés).
- Accès : mêmes règles que `/api/analyses` (admin voit tout, sinon patient ou cercle de soins). Les utilisateurs non synchronisés reçoivent un Bundle vide.
- Terminologies : LOINC appliqué aux rapports labo (`11502-2`) et à plusieurs examens (TSH `3016-3`, T3 libre `3051-0`, T4 libre `3024-7`, LDL `18262-6`, HDL `2085-9`, Chol total `2093-3`, HbA1c `4548-4`, glycémie `2345-7`, CRP `1988-5`, fibrinogène `3255-7`, Hb `718-7`, plaquettes `26515-7`, GB `6690-2`), sinon code système placeholder `https://example.org/*`. Les unités utilisent UCUM si renseignées. `codeNOS` est exporté dans l’Organization (identifier + type) avec placeholder si non renseigné.
- Enrichissements : Organization exporte `identifier` NOS ; Observations portent UCUM sur les unités et une Interpretation codée (v3-ObservationInterpretation) quand un texte d’interprétation est présent.
- Test rapide (auth requise, sinon OperationOutcome Unauthorized) :
  ```bash
  curl -H "Authorization: Bearer <token>" http://localhost:3000/api/fhir/analyses | jq .
  ```

- Endpoint : `GET /api/fhir/organizations` retourne un Bundle FHIR des établissements (Organization) avec identifier NOS (si renseigné).
  ```bash
  curl -H "Authorization: Bearer <token>" http://localhost:3000/api/fhir/organizations | jq .
  ```

- Endpoint : `GET /api/fhir/imaging` expose un flux POC d’échographie (ServiceRequest US thyroid, ImagingStudy, DiagnosticReport) lié au premier patient/pro dispo et à un hôpital (Organization avec NOS si présent).
  ```bash
  curl -H "Authorization: Bearer <token>" http://localhost:3000/api/fhir/imaging | jq .
  ```

- Endpoints FHIR par ressource (POC) :
  - `GET /api/fhir/patients` (identifiers : local + INS si présent)
  - `GET /api/fhir/servicerequests`
    - `POST /api/fhir/servicerequests` (création d’une analyse à partir d’un ServiceRequest FHIR : subject Patient/{id}, performer Organization/{id}, examens[] optionnel)
  - `GET /api/fhir/observations` (+ `POST` pour stocker un Observation raw)
  - `GET /api/fhir/diagnosticreports` (+ `POST` pour stocker un DiagnosticReport raw)
  - `GET /api/fhir/subscriptions` / `POST /api/fhir/subscriptions` pour créer/lister des subscriptions persistées (rest-hook best-effort)

## Installation et configuration

### Prérequis

- Node.js 18+
- MongoDB 6+
- Keycloak 24+ (optionnel pour le dev local)
- Docker (recommandé pour MongoDB et Keycloak)

### 1. Cloner et installer

\`\`\`bash
git clone <repo-url>
cd epitanie
npm install
\`\`\`

### 2. Configurer MongoDB

**Avec Docker** :
\`\`\`bash
docker run -d \
  --name mongodb \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=root \
  -e MONGO_INITDB_ROOT_PASSWORD=password \
  mongo:7
\`\`\`

**Connection string** :
\`\`\`
mongodb://root:password@localhost:27017/epitanie?authSource=admin
\`\`\`

### 3. Configurer Keycloak

**Avec Docker** :
\`\`\`bash
docker run -d --name keycloak -p 8080:8080 \
  -e KEYCLOAK_ADMIN=admin \
  -e KEYCLOAK_ADMIN_PASSWORD=password \
  quay.io/keycloak/keycloak:24.0 start-dev
\`\`\`

#### Configuration du Realm Keycloak

1. Accéder à http://localhost:8080/admin (admin/password)
2. Créer un nouveau Realm : `epitanie`
3. Créer un Client : `epitanie-app`
   - Access Type: confidential
   - Valid Redirect URIs: `http://localhost:3000/*`
   - Web Origins: `http://localhost:3000`
4. Créer les rôles :
   - ROLE_PATIENT
   - ROLE_MEDECIN
   - ROLE_INFIRMIER
   - ROLE_SECRETARIAT
   - ROLE_ADMIN
5. Mapper les rôles au client (Client Scopes > roles)

### 4. Configurer les variables d'environnement

Copier `.env.local.example` en `.env.local` et ajuster :

\`\`\`bash
cp .env.local.example .env.local
\`\`\`

Éditer `.env.local` avec vos valeurs :
- `MONGODB_URI`: connexion MongoDB
- `KEYCLOAK_*`: URL et credentials Keycloak
- `NEXT_PUBLIC_*`: variables publiques

### 5. Lancer l'application

\`\`\`bash
npm run dev
\`\`\`

L'app est accessible sur http://localhost:3000

### 6. Peupler la base de données

1. Connectez-vous une fois avec chaque compte Keycloak (admin, secrétariat, médecin, infirmier, patient) afin de créer les utilisateurs dans MongoDB.
2. Vérifiez que `MONGODB_URI` est défini dans `.env.local`.
3. Lancez le script de seed :

```bash
pnpm seed
```

Le script vide les collections métier (patients, professionnels, rendez-vous, documents, analyses, messages) puis insère un jeu de données cohérent pour tester les dashboards.

## Architecture API

### Principes

- Authentification JWT via Keycloak sur toutes les routes `/api/*`
- Autorisation RBAC : chaque route vérifie rôles et permissions
- Isolation des données : cercle de soins, appartenance client-patient, etc.

### Endpoints (à implémenter)

| Route | Méthode | Description |
|-------|---------|-------------|
| `/api/patients` | GET, POST | Gestion patients |
| `/api/patients/[id]` | GET, PATCH | Détail et modification |
| `/api/rendezvous` | GET, POST | Gestion rendez-vous |
| `/api/documents` | GET, POST | Gestion documents cliniques |
| `/api/analyses` | GET, POST | Gestion analyses biologiques |
| `/api/messages` | GET, POST | Messagerie interne |

## Dashboards par rôle

### ADMIN
- Gestion utilisateurs et Keycloak
- CRUD établissements et professionnels
- Vue synthétique globale

### SECRETARIAT
- Gestion des rendez-vous (création, modification)
- Gestion des patients et documents
- Filtrage par date et professionnel

### MEDECIN / INFIRMIER
- Fiche patient détaillée (cercle de soins)
- Création de documents cliniques
- Prescription d'analyses biologiques

### PATIENT
- Fiche personnelle (lecture seule)
- Rendez-vous personnels
- Documents et résultats d'analyses
- Messagerie interne

## Extensions futures

- Intégration FHIR pour interopérabilité
- Stockage fichiers (S3, Vercel Blob)
- Signature électronique de documents
- Notifications email/SMS
- Calendrier interactif
- Export PDF de dossiers

## Support et contribution

Pour les questions ou bugs, ouvrir une issue sur le dépôt.

---

**Version**: 0.1.0 (POC Académique)
**Licence**: MIT
