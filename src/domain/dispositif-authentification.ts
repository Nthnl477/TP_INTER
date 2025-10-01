import { ObjectId } from "mongodb";
import {
  CodeSerializer,
  DateTimeSerializer,
  IdentifierSerializer,
  MetadataSerializer,
  TelecommunicationSerializer,
  TextSerializer,
} from "./serialization";
import { CarteProfessionnel, Certificat, DispositifAuthentification } from "./types";
import { stripUndefined } from "./utils";

const sanitizeCarte = (value: CarteProfessionnel): CarteProfessionnel =>
  stripUndefined({
    ...value,
    typeCarte: value.typeCarte ? CodeSerializer.toDocument(value.typeCarte) : undefined,
    numeroCarte: value.numeroCarte ? TextSerializer.toDocument(value.numeroCarte) : undefined,
    dateDebutValidite: value.dateDebutValidite
      ? DateTimeSerializer.toDocument(value.dateDebutValidite)
      : undefined,
    dateFinValidite: value.dateFinValidite ? DateTimeSerializer.toDocument(value.dateFinValidite) : undefined,
    dateOpposition: value.dateOpposition ? DateTimeSerializer.toDocument(value.dateOpposition) : undefined,
    metadonnee: value.metadonnee ? MetadataSerializer.toDocument(value.metadonnee) : undefined,
  });

const sanitizeCertificat = (value: Certificat): Certificat =>
  stripUndefined({
    ...value,
    numeroSerie: value.numeroSerie ? TextSerializer.toDocument(value.numeroSerie) : undefined,
    aneNiveau: value.aneNiveau ? TextSerializer.toDocument(value.aneNiveau) : undefined,
    dnsSujet: value.dnsSujet ? TextSerializer.toDocument(value.dnsSujet) : undefined,
    dateDebutValidite: value.dateDebutValidite
      ? DateTimeSerializer.toDocument(value.dateDebutValidite)
      : undefined,
    dateFinValidite: value.dateFinValidite ? DateTimeSerializer.toDocument(value.dateFinValidite) : undefined,
    usage: value.usage ? CodeSerializer.toDocument(value.usage) : undefined,
    domaine: value.domaine ? TextSerializer.toDocument(value.domaine) : undefined,
    adresseEmail: value.adresseEmail ? TelecommunicationSerializer.toDocument(value.adresseEmail) : undefined,
    usageProfessionnel: value.usageProfessionnel
      ? CodeSerializer.toDocument(value.usageProfessionnel)
      : undefined,
    typeCarte: value.typeCarte ? CodeSerializer.toDocument(value.typeCarte) : undefined,
    identifiant: value.identifiant ? IdentifierSerializer.toDocument(value.identifiant) : undefined,
    valeurPublique: value.valeurPublique ? TextSerializer.toDocument(value.valeurPublique) : undefined,
    statutPublication: value.statutPublication ? TextSerializer.toDocument(value.statutPublication) : undefined,
    metadonnee: value.metadonnee ? MetadataSerializer.toDocument(value.metadonnee) : undefined,
  });

const sanitizeDispositif = (value: DispositifAuthentification): DispositifAuthentification =>
  stripUndefined({
    ...value,
    cartes: value.cartes?.map(sanitizeCarte),
    certificats: value.certificats?.map(sanitizeCertificat),
  });

export interface DispositifAuthentificationDocument extends DispositifAuthentification {
  _id: ObjectId;
}

export interface DispositifAuthentificationDto extends DispositifAuthentification {
  id: string;
}

export const DISPOSITIF_AUTHENTIFICATION_COLLECTION = "dispositifsAuthentification";

export const DispositifAuthentificationSerializer = {
  toDocument(input: DispositifAuthentification): DispositifAuthentification {
    return sanitizeDispositif(input);
  },
  fromDocument(
    document: DispositifAuthentificationDocument,
  ): DispositifAuthentificationDto {
    const { _id, ...rest } = document;
    const base = sanitizeDispositif(rest);
    return {
      id: _id.toHexString(),
      ...base,
    };
  },
  sanitize: sanitizeDispositif,
};
