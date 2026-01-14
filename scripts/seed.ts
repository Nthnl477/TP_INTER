import fs from "fs"
import path from "path"
import mongoose from "mongoose"

import connectToDatabase from "../lib/db/connection"
import { User, type IUser } from "../lib/db/models/User"
import { Etablissement, type IEtablissement } from "../lib/db/models/Etablissement"
import { ProfessionnelDeSante } from "../lib/db/models/ProfessionnelDeSante"
import { Patient } from "../lib/db/models/Patient"
import { RendezVous } from "../lib/db/models/RendezVous"
import { DocumentClinique } from "../lib/db/models/DocumentClinique"
import { AnalyseBiologique } from "../lib/db/models/AnalyseBiologique"
import { MessageInterne } from "../lib/db/models/MessageInterne"

type SeedUsers = {
  admin: IUser
  secretariat: IUser
  medecin: IUser
  infirmier: IUser
  patient: IUser
}

function loadEnvFile(filePath = ".env.local") {
  const resolved = path.resolve(process.cwd(), filePath)
  if (!fs.existsSync(resolved)) {
    console.warn(`[seed] No ${filePath} file found, relying on process.env`)
    return
  }

  const lines = fs.readFileSync(resolved, "utf-8").split(/\r?\n/)
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue

    const eqIndex = trimmed.indexOf("=")
    if (eqIndex === -1) continue

    const key = trimmed.slice(0, eqIndex).trim()
    let value = trimmed.slice(eqIndex + 1).trim()

    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1)
    }

    if (!(key in process.env)) {
      process.env[key] = value
    }
  }
}

async function fetchUsers(): Promise<SeedUsers> {
  const seedEmails = {
    admin: "admin@epitanie.fr",
    secretariat: "secretariat@epitanie.fr",
    medecin: "medecin@epitanie.fr",
    infirmier: "infirmier@epitanie.fr",
    patient: "patient@epitanie.fr",
  } as const

  const entries = await Promise.all(
    Object.entries(seedEmails).map(async ([key, email]) => {
      const user = await User.findOne({ email })
      if (!user) {
        throw new Error(
          `Missing user ${email}. Connect with this Keycloak account at least once so it is synchronized in MongoDB.`,
        )
      }
      return [key, user] as const
    }),
  )

  return Object.fromEntries(entries) as SeedUsers
}

async function clearCollections() {
  await Promise.all([
    MessageInterne.deleteMany({}),
    AnalyseBiologique.deleteMany({}),
    DocumentClinique.deleteMany({}),
    RendezVous.deleteMany({}),
    Patient.deleteMany({}),
    ProfessionnelDeSante.deleteMany({}),
    Etablissement.deleteMany({}),
  ])
}

async function seed() {
  loadEnvFile()

  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI must be defined in the environment before running the seed script.")
  }

  await connectToDatabase()
  console.info("[seed] Connected to MongoDB")

  await clearCollections()
  console.info("[seed] Cleared existing documents")

  const users = await fetchUsers()

  const establishments = (await Etablissement.create([
    {
      nom: "Centre Hospitalier Epitanie",
      typeEtablissement: "HOPITAL",
      codeNOS: "750100123",
      adresseSimplifiee: "25 Avenue des Lilas, 75010 Paris",
    },
    {
      nom: "Cabinet Médical République",
      typeEtablissement: "CABINET_LIBERAL",
      adresseSimplifiee: "8 Rue Oberkampf, 75011 Paris",
    },
    {
      nom: "Laboratoire Biofast Epitanie",
      typeEtablissement: "LABORATOIRE",
      codeNOS: "750100456",
      adresseSimplifiee: "12 Rue de la Santé, 75013 Paris",
    },
  ])) as IEtablissement[]
  const [hopital, cabinet, laboratoire] = establishments
  console.info("[seed] Created establishments")

  const medecinProfessionnel = await ProfessionnelDeSante.create({
    utilisateur: users.medecin._id,
    type: "MEDECIN",
    specialite: "Cardiologie",
    rpps: "10100100011",
    etablissement: hopital._id,
  })

  const infirmierProfessionnel = await ProfessionnelDeSante.create({
    utilisateur: users.infirmier._id,
    type: "INFIRMIER",
    specialite: "Soins intensifs",
    etablissement: hopital._id,
  })

  console.info("[seed] Created health professionals")

  const patient = await Patient.create({
    utilisateur: users.patient._id,
    identifiantPatientLocal: "PAT-0001",
    ins: "1 90 01 75 123 456 78",
    nom: users.patient.nom,
    prenom: users.patient.prenom,
    dateNaissance: new Date("1990-05-12"),
    sexe: "F",
    coordonnees: {
      telephone: "+33 6 11 22 33 44",
      email: users.patient.email,
      adresse: "42 Rue de Paris, 75010 Paris",
    },
    professionnelsDuCercleDeSoin: [users.medecin._id, users.infirmier._id, users.secretariat._id],
  })
  console.info("[seed] Created patient dossier")

  const rendezVous = await RendezVous.create({
    patient: patient._id,
    professionnel: medecinProfessionnel._id,
    dateHeureDebut: new Date(Date.now() + 24 * 60 * 60 * 1000),
    dateHeureFin: new Date(Date.now() + 24 * 60 * 60 * 1000 + 30 * 60 * 1000),
    type: "Consultation de suivi cardiologique",
    statut: "PLANIFIE",
    creePar: users.secretariat._id,
  })
  console.info("[seed] Created rendez-vous", rendezVous._id.toHexString())

  await DocumentClinique.create([
    {
      patient: patient._id,
      auteur: medecinProfessionnel._id,
      typeDocument: "COMPTE_RENDU",
      titre: "Premier compte rendu cardiologique",
      contenuTexte:
        "Patient revue pour une dyspnée d'effort. Recommandations : poursuite du traitement beta-bloquant et contrôle dans 3 mois.",
      codesNOSOuAutres: ["CIM10-I251"],
    },
    {
      patient: patient._id,
      auteur: infirmierProfessionnel._id,
      typeDocument: "NOTE_SOINS",
      titre: "Note de suivi infirmier",
      contenuTexte: "Suivi quotidien réalisé. Tension 120/70, pas d'œdème observé.",
      codesNOSOuAutres: [],
    },
  ])
  console.info("[seed] Added clinical documents")

  await AnalyseBiologique.create({
    patient: patient._id,
    prescripteur: medecinProfessionnel._id,
    laboratoire: laboratoire._id,
    datePrescription: new Date(),
    dateResultat: new Date(),
    statut: "VALIDE",
    examens: [
      {
        codeTest: "BIO-LDL",
        libelle: "Cholestérol LDL",
        valeur: "1.2",
        unite: "g/L",
        intervalleReference: "0.7 - 1.6 g/L",
        interpretation: "Dans la norme",
      },
      {
        codeTest: "BIO-HBA1C",
        libelle: "HbA1c",
        valeur: "6.1",
        unite: "%",
        intervalleReference: "< 6.5%",
        interpretation: "Pré-diabète à surveiller",
      },
    ],
  })
  console.info("[seed] Created biological analysis")

  await MessageInterne.create({
    dossierPatient: patient._id,
    auteur: users.medecin._id,
    destinataires: [users.infirmier._id, users.secretariat._id],
    contenu:
      "Merci de planifier un contrôle tensionnel hebdomadaire pendant les quatre prochaines semaines et de me transmettre toute anomalie.",
    dateEnvoi: new Date(),
    luPar: [users.medecin._id],
  })
  console.info("[seed] Inserted internal message")

  console.info("✅ Database seed completed successfully.")
}

seed()
  .catch((error) => {
    console.error("❌ Seeding failed:", error)
    process.exitCode = 1
  })
  .finally(async () => {
    if (mongoose.connection.readyState) {
      await mongoose.connection.close()
    }
  })
