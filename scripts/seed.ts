import "dotenv/config";
import { randomUUID } from "crypto";
import { ObjectId } from "mongodb";
import {
  getMongoClient,
  getPersonnePhysiqueCollection,
  getProfessionnelCollection,
  getPersonnePriseChargeCollection,
  getAutorisationCollection,
  getDispositifAuthentificationCollection,
  closeMongoClient,
} from "../src/lib/mongodb";
import {
  PersonnePhysiqueSerializer,
  ProfessionnelSerializer,
  PersonnePriseChargeSerializer,
  AutorisationSerializer,
  DispositifAuthentificationSerializer,
} from "../src/domain";
import {
  nosCode,
} from "../src/domain/nos";
import type {
  MosDate,
  MosDateTime,
  MosIdentifier,
  MosMetadata,
  MosText,
} from "../src/domain";

function isoDate(value: string): MosDate {
  return { valeur: value, format: "YYYY-MM-DD" };
}

function isoDateTime(value: string): MosDateTime {
  return { valeur: value, format: "YYYY-MM-DDTHH:mm:ss'Z'" };
}

function text(value: string, langue: string = "fr"): MosText {
  return { valeur: value, langue };
}

function identifier(value: string, systeme: string, typeKey: string): MosIdentifier {
  return {
    valeur: value,
    identifiantSysteme: systeme,
    typeIdentifiant: nosCode("roleProfessionnel", typeKey),
  };
}

function metadata(source: string, tags: string[]): MosMetadata {
  const nowIso = new Date().toISOString();
  return {
    commentaire: text(`Ensemencé par ${source}`),
    version: text(tags.join(", ") || "v1"),
    dateCreation: { valeur: nowIso, format: "iso8601" },
    dateMiseJour: { valeur: nowIso, format: "iso8601" },
  };
}

async function seed() {
  await getMongoClient();

  const sampleTag = "sample-data";

  const personnePhysiqueCollection = await getPersonnePhysiqueCollection();
  const professionnelCollection = await getProfessionnelCollection();
  const personnePriseChargeCollection = await getPersonnePriseChargeCollection();
  const autorisationCollection = await getAutorisationCollection();
  const dispositifAuthentificationCollection = await getDispositifAuthentificationCollection();

  await Promise.all([
    personnePhysiqueCollection.deleteMany({ "metadonnee.tags": sampleTag }),
    professionnelCollection.deleteMany({ "metadonnee.tags": sampleTag }),
    personnePriseChargeCollection.deleteMany({ "metadonnee.tags": sampleTag }),
    autorisationCollection.deleteMany({ "metadonnee.tags": sampleTag }),
    dispositifAuthentificationCollection.deleteMany({ "metadonnee.tags": sampleTag }),
  ]);

  const personnePhysique = PersonnePhysiqueSerializer.toDocument({
    identifiants: [
      {
        valeur: "198765432101234",
        identifiantSysteme: "urn:oid:1.2.250.1.213.1.4.8",
        typeIdentifiant: nosCode("roleProfessionnel", "MEDECIN"),
      },
    ],
    civilite: nosCode("civilite", "M"),
    nomNaissance: "Dupont",
    prenoms: ["Jean", "Michel"],
    dateNaissance: isoDate("1981-03-14"),
    sexe: nosCode("sexe", "M"),
    metadonnee: metadata("seed-script", [sampleTag]),
  });

  await personnePhysiqueCollection.insertOne({ ...personnePhysique, _id: new ObjectId() });

  const dispositifAuthentification = DispositifAuthentificationSerializer.toDocument({
    cartes: [
      {
        typeCarte: nosCode("typeCarte", "CPS"),
        numeroCarte: text("99887766"),
        dateDebutValidite: isoDateTime("2023-01-01T00:00:00Z"),
        dateFinValidite: isoDateTime("2026-12-31T23:59:59Z"),
        metadonnee: metadata("seed-script", [sampleTag]),
      },
    ],
    certificats: [
      {
        numeroSerie: text(randomUUID()),
        aneNiveau: text("niv3"),
        dnsSujet: text("cn=DUPOINTJEAN,ou=CPS,o=ANS"),
        dateDebutValidite: isoDateTime("2023-01-01T00:00:00Z"),
        dateFinValidite: isoDateTime("2024-12-31T23:59:59Z"),
        usage: nosCode("usageCertificat", "AUTH"),
        domaine: text("e-sante"),
        adresseEmail: {
        systeme: nosCode("usageCertificat", "AUTH"),
        usage: nosCode("usageProfessionnel", "PRESC"),
        valeur: "jean.dupont@esante.gouv.fr",
        metadonnee: metadata("seed-script", [sampleTag]),
      },
        usageProfessionnel: nosCode("usageProfessionnel", "PRESC"),
        typeCarte: nosCode("typeCarte", "CPS"),
        identifiant: identifier("CPS-99887766", "urn:oid:1.2.250.1.213.1.4.9", "MEDECIN"),
        valeurPublique: text("-----BEGIN PUBLIC KEY-----MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8A-----END PUBLIC KEY-----"),
        statutPublication: text("PUB"),
        metadonnee: metadata("seed-script", [sampleTag]),
      },
    ],
  });

  const dispositifResult = await dispositifAuthentificationCollection.insertOne({
    ...dispositifAuthentification,
    _id: new ObjectId(),
  });

  const professionnel = ProfessionnelSerializer.toDocument({
    idPP: identifier("IDPP-123456", "urn:oid:1.2.250.1.213.1.4.10", "MEDECIN"),
    typeIdentifPP: nosCode("roleProfessionnel", "MEDECIN"),
    idNatPS: identifier("RPPS-34987654321", "urn:oid:1.2.250.1.71", "MEDECIN"),
    personne: personnePhysique,
    telecommunication: [
      {
        systeme: nosCode("usageCertificat", "AUTH"),
        usage: nosCode("usageProfessionnel", "PRESC"),
        valeur: "+33102030405",
        metadonnee: metadata("seed-script", [sampleTag]),
      },
    ],
    exercicesProfessionnels: [
      {
        civiliteExercice: nosCode("civilite", "M"),
        nomExercice: text("Dupont"),
        prenomExercice: text("Jean"),
        titreProfessionnel: nosCode("roleProfessionnel", "MEDECIN"),
        categorieProfessionnelle: nosCode("roleProfessionnel", "MEDECIN"),
        dateDebutExercice: isoDate("2010-05-01"),
        situationsExercice: [
          {
            role: nosCode("roleProfessionnel", "MEDECIN"),
            modeExercice: nosCode("modeExercice", "LIBERAL"),
            numeroAM: identifier("AM-12345", "urn:oid:1.2.250.1.71.4.2", "MEDECIN"),
            telecommunication: [],
            metadonnee: metadata("seed-script", [sampleTag]),
          },
        ],
        dispositifsAuthentification: [dispositifAuthentification],
        metadonnee: metadata("seed-script", [sampleTag]),
      },
    ],
    metadonnee: metadata("seed-script", [sampleTag]),
  });

  await professionnelCollection.insertOne({
    ...professionnel,
    _id: new ObjectId(),
  });

  const personnePriseCharge = PersonnePriseChargeSerializer.toDocument({
    personne: {
      ...personnePhysique,
      nomNaissance: "Martin",
      prenoms: ["Alice"],
      civilite: nosCode("civilite", "F"),
      sexe: nosCode("sexe", "F"),
    },
    metadonnee: metadata("seed-script", [sampleTag]),
  });

  await personnePriseChargeCollection.insertOne({ ...personnePriseCharge, _id: new ObjectId() });

  const autorisation = AutorisationSerializer.toDocument({
    identifiants: [identifier("AUTO-123", "urn:oid:1.2.250.1.213.1.5.1", "MEDECIN")],
    activitesSoinAutorisees: [
      {
        numeroAutorisation: identifier("AUTO-123", "urn:oid:1.2.250.1.213.1.5.1", "MEDECIN"),
        dateDecision: isoDate("2022-01-10"),
        activite: nosCode("discipline", "MED_GEN"),
        metadonnee: metadata("seed-script", [sampleTag]),
      },
    ],
    capacitesActivites: [
      {
        habilitationAideSociale: nosCode("habilitation", "AIDE_SOCIALE"),
        modeFinancement: nosCode("modeFinancement", "CPAM"),
        capaciteAccueil: {
          idCapaciteAccueil: identifier("CAP-ACC-1", "urn:oid:1.2.250.1.213.1.5.3", "MEDECIN"),
          mesures: [
            {
              typeMesure: "generale",
              nature: nosCode("discipline", "MED_GEN"),
              nombreCapacite: { valeur: 12, metadonnee: metadata("seed-script", [sampleTag]) },
              metadonnee: metadata("seed-script", [sampleTag]),
            },
          ],
          metadonnee: metadata("seed-script", [sampleTag]),
        },
        metadonnee: metadata("seed-script", [sampleTag]),
      },
    ],
    metadonnee: metadata("seed-script", [sampleTag]),
  });

  await autorisationCollection.insertOne({ ...autorisation, _id: new ObjectId() });
}

seed()
  .then(() => {
    console.log("Sample MOS data inserted with tag 'sample-data'.");
    return closeMongoClient();
  })
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("Erreur lors de l'insertion des données de démonstration", error);
    closeMongoClient().finally(() => process.exit(1));
  });
