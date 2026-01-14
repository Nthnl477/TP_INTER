# Plateforme de Coordination Ville-Hôpital - Epitanie

## Vue d'ensemble

Epitanie est une plateforme full-stack de coordination entre professionnels de santé (médecins, infirmiers, secrétariats) et patients pour la gestion centralisée de dossiers médicaux, rendez-vous et analyses biologiques.

### Stack technique

- **Frontend/Backend**: Next.js 16+ (App Router) avec TypeScript
- **UI**: Tailwind CSS + composants shadcn/ui
- **Base de données**: MongoDB avec Mongoose
- **Authentification**: Keycloak (OIDC) avec RBAC
- **Déploiement**: Vercel-ready

### Couverture des TD (vue rapide)

- **TD1 (MOS/NOS)** : Etablissements avec code NOS/placeholder, documents pouvant porter des codes terminologiques, MOS minimal (patients, pros, établissements, RDV, analyses, documents, messages).
- **TD2 (FHIR POC)** : Exposition FHIR en lecture/écriture (ServiceRequest, Observation, DiagnosticReport, Patient, Organization, DocumentReference, ImagingStudy) + Subscriptions REST-hook persistées.
- **TD3 (échanges)** : Scénarios d’échange CR + prescription + résultats (labo + imagerie) rejouables via commandes cURL ci-dessous ; notifications déclenchées sur créations.

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
- **NOS (nomenclature)** : Etablissements avec `codeNOS` optionnel (utilisé dans les analyses et exposé en FHIR), documents cliniques pouvant stocker des codes terminologiques (NOS/CIM-10). Pas de JDV/TRE ni SMT, libellés de statuts et types restent des énumérations locales.
- **Portée limitée** : Pas de versioning NOS, pas de navigation SMT ; JDV/TRE non implémentés.

### Webservice FHIR (POC TD2/TD3)

- `GET /api/fhir/analyses` : Bundle avec ServiceRequest, DiagnosticReport, Observation, Patient, Practitioner, Organization (NOS en identifier/type). Terminologies LOINC (rapport labo 11502-2, TSH 3016-3, T3L 3051-0, T4L 3024-7, LDL 18262-6, HDL 2085-9, chol. total 2093-3, HbA1c 4548-4, glycémie 2345-7, CRP 1988-5, fibrinogène 3255-7, Hb 718-7, plaquettes 26515-7, GB 6690-2), UCUM sur les unités. Accès = mêmes règles que `/api/analyses`.
- Ressources par endpoint :
  - Patients : `GET /api/fhir/patients` (+ `POST/PUT` Patient raw, identifiants local/INS)
  - ServiceRequest : `GET/POST /api/fhir/servicerequests` (POST crée une analyse interne)
  - Observation : `GET/POST /api/fhir/observations` (stockage raw)
  - DiagnosticReport : `GET/POST /api/fhir/diagnosticreports` (stockage raw)
  - Organization : `GET/POST/PUT /api/fhir/organizations` (NOS en identifier/type)
  - DocumentReference : `GET/POST/PUT /api/fhir/documentreferences`
  - ImagingStudy/DocumentReference (imagerie) : `GET/POST/PUT /api/fhir/imaging` (flux écho POC enrichi)
  - Subscriptions : `GET/POST /api/fhir/subscriptions` (persisté, rest-hook best-effort)

### Scénarios TD1/TD2/TD3 (tests manuels)

Prérequis : serveur lancé, Keycloak configuré, `TOKEN` Bearer valide (récupéré via Keycloak `/protocol/openid-connect/token` avec vos credentials), IDs Mongo pour `PATIENT_ID`, `LAB_ID` (Organization labo). Base : `BASE=http://localhost:3000`.

**TD1 (MOS/NOS)**
- NOS : `curl -H "Authorization: Bearer $TOKEN" $BASE/api/fhir/organizations | jq .`
- Analyses exposées : `curl -H "Authorization: Bearer $TOKEN" $BASE/api/fhir/analyses | jq .`

**TD2 (FHIR POC)**
- Patients : `curl -H "Authorization: Bearer $TOKEN" $BASE/api/fhir/patients | jq .`
- Prescription d’analyse (ServiceRequest) :
  curl -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/fhir+json" \
    -d '{"resourceType":"ServiceRequest","status":"active","intent":"order","subject":{"reference":"Patient/'"$PATIENT_ID"'"},"performer":[{"reference":"Organization/'"$LAB_ID"'"}],"authoredOn":"'"$(date -Iseconds)"'","examens":[{"codeTest":"BIO-TSH","libelle":"TSH"}]}' \
    $BASE/api/fhir/servicerequests | jq .
- Subscription rest-hook :
  curl -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
    -d '{"criteria":"Appointment","channel":{"type":"rest-hook","endpoint":"https://example.org/webhook","payload":"application/fhir+json"}}' \
    $BASE/api/fhir/subscriptions | jq .

**TD3 (échange CR + prescription + résultats)**
1) CR médecin (DocumentReference) :
  curl -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/fhir+json" \
    -d '{"resourceType":"DocumentReference","status":"current","type":{"coding":[{"system":"http://loinc.org","code":"11506-3","display":"Consult note"}]},"subject":{"reference":"Patient/'"$PATIENT_ID"'"},"content":[{"attachment":{"contentType":"text/plain","data":"'"$(echo -n "CR endocrinologue (suspicion Basedow)" | base64)"'"}}]}' \
    $BASE/api/fhir/documentreferences | jq .
2) Prescription (ServiceRequest TSH/T3/T4) : commande TD2 ci-dessus (examens BIO-TSH/BIO-T3L/BIO-T4L si besoin).
3) Résultats labo (Observations + DiagnosticReport) :
  curl -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/fhir+json" \
    -d '{"resourceType":"Observation","status":"final","code":{"coding":[{"system":"http://loinc.org","code":"3016-3","display":"TSH"}]},"subject":{"reference":"Patient/'"$PATIENT_ID"'"},"valueQuantity":{"value":0.9,"unit":"µUI/mL","system":"http://unitsofmeasure.org","code":"uIU/mL"}}' \
    $BASE/api/fhir/observations | jq .

  curl -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/fhir+json" \
    -d '{"resourceType":"DiagnosticReport","status":"final","code":{"coding":[{"system":"http://loinc.org","code":"11502-2","display":"Laboratory report"}]},"subject":{"reference":"Patient/'"$PATIENT_ID"'"},"conclusion":"Résultats TSH/T3/T4 reçus (exemple TD3)."}' \
    $BASE/api/fhir/diagnosticreports | jq .
4) Imagerie (écho POC enrichie) : `curl -H "Authorization: Bearer $TOKEN" $BASE/api/fhir/imaging | jq .`

**Notifications**
- Les créations de message, document, rendez-vous, ServiceRequest/analyses déclenchent un rest-hook best-effort vers les endpoints configurés dans les subscriptions. Prévoir un mock webhook (ex. webhook.site) pour vérifier la réception.


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

- Authentification JWT via Keycloak sur les routes `/api/*`
- Autorisation RBAC : rôles patient/médecin/infirmier/secrétariat/admin
- Isolation des données : cercle de soins et appartenance patient-professionnel

### Endpoints applicatifs (hors FHIR)

| Route | Méthode | Description |
|-------|---------|-------------|
| `/api/patients` | GET | Liste des patients (filtre cercle de soins) |
| `/api/patients/[id]` | GET | Dossier patient |
| `/api/rendezvous` | GET, POST | RDV (création + filtre patientId/professionnel) |
| `/api/documents` | GET, POST | Documents cliniques |
| `/api/analyses` | GET, POST | Analyses internes (ServiceRequest/DiagnosticReport/Observation internes) |
| `/api/messages` | GET, POST | Messagerie interne |

### Endpoints FHIR (POC TD2/TD3)

| Route | Méthode | Description |
|-------|---------|-------------|
| `/api/fhir/analyses` | GET | Bundle ServiceRequest/DiagnosticReport/Observation + ressources liées |
| `/api/fhir/patients` | GET, POST, PUT | Patient FHIR (identifiants, INS) |
| `/api/fhir/servicerequests` | GET, POST | Prescription (crée analyse interne) |
| `/api/fhir/observations` | GET, POST | Observation (stockage raw) |
| `/api/fhir/diagnosticreports` | GET, POST | DiagnosticReport (stockage raw) |
| `/api/fhir/organizations` | GET, POST, PUT | Organization (NOS) |
| `/api/fhir/documentreferences` | GET, POST, PUT | DocumentReference |
| `/api/fhir/imaging` | GET, POST, PUT | ImagingStudy + DocumentReference |
| `/api/fhir/subscriptions` | GET, POST | Subscriptions REST-hook persistées |

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