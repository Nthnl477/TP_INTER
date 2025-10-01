import {
  MongoClient,
  Db,
  Collection,
  MongoClientOptions,
  ServerApiVersion,
  type Document,
} from "mongodb";
import { env } from "../config/env";
import {
  PERSONNE_PHYSIQUE_COLLECTION,
  PROFESSIONNEL_COLLECTION,
  PERSONNE_PRISE_CHARGE_COLLECTION,
  AUTORISATIONS_COLLECTION,
  DISPOSITIF_AUTHENTIFICATION_COLLECTION,
  type PersonnePhysiqueDocument,
  type ProfessionnelDocument,
  type PersonnePriseChargeDocument,
  type AutorisationDocument,
  type DispositifAuthentificationDocument,
} from "../domain";

interface MongoClientCache {
  clientPromise?: Promise<MongoClient>;
}

const globalForMongo = globalThis as typeof globalThis & MongoClientCache;

const clientOptions: MongoClientOptions = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
};

function getClientPromise(): Promise<MongoClient> {
  if (!globalForMongo.clientPromise) {
    const client = new MongoClient(env.mongodbUri, clientOptions);
    globalForMongo.clientPromise = client.connect();
  }
  return globalForMongo.clientPromise;
}

export async function getMongoClient(): Promise<MongoClient> {
  return getClientPromise();
}

export async function getDb(dbName: string = env.mongodbDb): Promise<Db> {
  const client = await getClientPromise();
  return client.db(dbName);
}

export async function getCollection<TSchema extends Document = Document>(
  collectionName: string,
  dbName: string = env.mongodbDb,
): Promise<Collection<TSchema>> {
  const db = await getDb(dbName);
  return db.collection<TSchema>(collectionName);
}

export async function closeMongoClient(): Promise<void> {
  if (!globalForMongo.clientPromise) {
    return;
  }
  const client = await globalForMongo.clientPromise;
  await client.close();
  delete globalForMongo.clientPromise;
}

export async function getPersonnePhysiqueCollection() {
  return getCollection<PersonnePhysiqueDocument>(PERSONNE_PHYSIQUE_COLLECTION);
}

export async function getProfessionnelCollection() {
  return getCollection<ProfessionnelDocument>(PROFESSIONNEL_COLLECTION);
}

export async function getPersonnePriseChargeCollection() {
  return getCollection<PersonnePriseChargeDocument>(PERSONNE_PRISE_CHARGE_COLLECTION);
}

export async function getAutorisationCollection() {
  return getCollection<AutorisationDocument>(AUTORISATIONS_COLLECTION);
}

export async function getDispositifAuthentificationCollection() {
  return getCollection<DispositifAuthentificationDocument>(
    DISPOSITIF_AUTHENTIFICATION_COLLECTION,
  );
}
