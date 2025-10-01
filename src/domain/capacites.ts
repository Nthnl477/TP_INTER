import { ObjectId } from "mongodb";
import {
  CapacitySerializer,
  IdentifierSerializer,
  MetadataSerializer,
} from "./serialization";
import {
  MosCapacity,
  MosCapacityAvailable,
  MosCapacityInstalled,
  MosCapacitySupplementary,
  MosCapacityClosed,
  MosIdentifier,
  MosMetadata,
} from "./types";
import { stripUndefined } from "./utils";

export type TypeMesureCapacite =
  | "generale"
  | "fermee"
  | "supplementaire"
  | "installee"
  | "disponible";

export type MesureCapacite =
  | (MosCapacity & { typeMesure?: "generale" })
  | (MosCapacityClosed & { typeMesure: "fermee" })
  | (MosCapacitySupplementary & { typeMesure: "supplementaire" })
  | (MosCapacityInstalled & { typeMesure: "installee" })
  | (MosCapacityAvailable & { typeMesure: "disponible" });

export interface CapaciteAccueil {
  idCapaciteAccueil?: MosIdentifier;
  mesures?: MesureCapacite[];
  metadonnee?: MosMetadata;
}

export interface CapaciteAdaptation {
  idCapaciteAdaptation?: MosIdentifier;
  mesures?: MesureCapacite[];
  metadonnee?: MosMetadata;
}

const sanitizeMesureCapacite = (mesure: MesureCapacite): MesureCapacite => {
  const base = CapacitySerializer.toDocument(mesure);

  switch (mesure.typeMesure) {
    case "fermee":
      return stripUndefined({
        ...base,
        typeMesure: "fermee" as const,
        typeFermetureCapacite: mesure.typeFermetureCapacite,
      }) as MesureCapacite;
    case "supplementaire":
      return stripUndefined({
        ...base,
        typeMesure: "supplementaire" as const,
        typeLitsSupplementaire: mesure.typeLitsSupplementaire,
        typeCrise: mesure.typeCrise,
      }) as MesureCapacite;
    case "installee":
      return stripUndefined({
        ...base,
        typeMesure: "installee" as const,
        anneeReference: mesure.anneeReference,
      }) as MesureCapacite;
    case "disponible":
      return stripUndefined({
        ...base,
        typeMesure: "disponible" as const,
        genreConcerne: mesure.genreConcerne,
      }) as MesureCapacite;
    default:
      return stripUndefined({
        ...base,
        typeMesure: (mesure.typeMesure ?? "generale") as "generale",
      }) as MesureCapacite;
  }
};

const sanitizeCapaciteAccueil = (value: CapaciteAccueil): CapaciteAccueil =>
  stripUndefined({
    ...value,
    idCapaciteAccueil: value.idCapaciteAccueil
      ? IdentifierSerializer.toDocument(value.idCapaciteAccueil)
      : undefined,
    mesures: value.mesures?.map(sanitizeMesureCapacite),
    metadonnee: value.metadonnee ? MetadataSerializer.toDocument(value.metadonnee) : undefined,
  });

const sanitizeCapaciteAdaptation = (value: CapaciteAdaptation): CapaciteAdaptation =>
  stripUndefined({
    ...value,
    idCapaciteAdaptation: value.idCapaciteAdaptation
      ? IdentifierSerializer.toDocument(value.idCapaciteAdaptation)
      : undefined,
    mesures: value.mesures?.map(sanitizeMesureCapacite),
    metadonnee: value.metadonnee ? MetadataSerializer.toDocument(value.metadonnee) : undefined,
  });

export interface CapaciteAccueilDocument extends CapaciteAccueil {
  _id: ObjectId;
}

export interface CapaciteAdaptationDocument extends CapaciteAdaptation {
  _id: ObjectId;
}

export interface CapaciteAccueilDto extends CapaciteAccueil {
  id: string;
}

export interface CapaciteAdaptationDto extends CapaciteAdaptation {
  id: string;
}

export const CapaciteAccueilSerializer = {
  toDocument(input: CapaciteAccueil): CapaciteAccueil {
    return sanitizeCapaciteAccueil(input);
  },
  fromDocument(document: CapaciteAccueilDocument): CapaciteAccueilDto {
    const { _id, ...rest } = document;
    const base = sanitizeCapaciteAccueil(rest);
    return {
      id: _id.toHexString(),
      ...base,
    };
  },
  sanitize: sanitizeCapaciteAccueil,
};

export const CapaciteAdaptationSerializer = {
  toDocument(input: CapaciteAdaptation): CapaciteAdaptation {
    return sanitizeCapaciteAdaptation(input);
  },
  fromDocument(document: CapaciteAdaptationDocument): CapaciteAdaptationDto {
    const { _id, ...rest } = document;
    const base = sanitizeCapaciteAdaptation(rest);
    return {
      id: _id.toHexString(),
      ...base,
    };
  },
  sanitize: sanitizeCapaciteAdaptation,
};
