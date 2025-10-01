import { ObjectId } from "mongodb";
import {
  CapaciteAccueilSerializer,
  CapaciteAdaptationSerializer,
} from "./capacites";
import {
  CodeSerializer,
  DateSerializer,
  IdentifierSerializer,
  IndicatorSerializer,
  MetadataSerializer,
  TextSerializer,
} from "./serialization";
import { CapaciteAccueil, CapaciteAdaptation } from "./capacites";
import {
  MosCode,
  MosDate,
  MosIdentifier,
  MosIndicator,
  MosMetadata,
  MosText,
} from "./types";
import { stripUndefined } from "./utils";

export interface ActiviteSoinAutorisee {
  numeroAutorisation?: MosIdentifier;
  dateDecision?: MosDate;
  activite?: MosCode;
  modalite?: MosCode;
  mode?: MosCode;
  datePremiereMiseEnOeuvre?: MosDate;
  dateFin?: MosDate;
  suppressionAutorisation?: MosIndicator;
  suspensionAutorisation?: MosIndicator;
  metadonnee?: MosMetadata;
}

export interface AutreActiviteSoumiseAutorisation {
  numeroAutorisation?: MosIdentifier;
  dateDecision?: MosDate;
  activite?: MosCode;
  modalite?: MosCode;
  forme?: MosCode;
  mode?: MosCode;
  datePremiereMiseEnOeuvre?: MosDate;
  dateFin?: MosDate;
  metadonnee?: MosMetadata;
}

export interface ActiviteSoumiseReconnaissance {
  numeroReconnaissance?: MosIdentifier;
  dateDecision?: MosDate;
  modalite?: MosCode;
  code?: MosCode;
  forme?: MosCode;
  numeroCertification?: MosIdentifier;
  dateCertification?: MosDate;
  indicateurReconnaissanceRegionale?: MosIndicator;
  metadonnee?: MosMetadata;
}

export interface ActiviteEnseignement {
  agregatDisciplineNiveau1?: MosCode;
  agregatDisciplineNiveau2?: MosCode;
  agregatDisciplineNiveau3?: MosCode;
  discipline?: MosCode;
  modeFonctionnement?: MosCode;
  dateAutorisation?: MosDate;
  suppressionAutorisation?: MosIndicator;
  metadonnee?: MosMetadata;
}

export interface ActiviteSociale {
  dateAutorisation?: MosDate;
  dateMiseAJourAutorisation?: MosDate;
  dateDerniereInstallation?: MosDate;
  dateFinAutorisation?: MosDate;
  dateSuspensionAutorisation?: MosDate;
  agregatDisciplineNiveau1?: MosCode;
  agregatDisciplineNiveau2?: MosCode;
  agregatDisciplineNiveau3?: MosCode;
  discipline?: MosCode;
  agrémentNational?: MosCode;
  agrémentRegional?: MosCode;
  sourceReconnaissance?: MosCode;
  sourceInternationalisation?: MosCode;
  capaciteActivite?: CapaciteActiviteExerce;
  metadonnee?: MosMetadata;
}

export interface EquipementMaterielLourd {
  numeroAutorisation?: MosIdentifier;
  equipement?: MosCode;
  dateDecision?: MosDate;
  datePremiereMiseEnOeuvre?: MosDate;
  dateFin?: MosDate;
  numeroSerie?: MosText;
  marque?: MosText;
  modele?: MosText;
  suppressionAutorisation?: MosIndicator;
  metadonnee?: MosMetadata;
}

export interface CapaciteActiviteExerce {
  habilitationAideSociale?: MosCode;
  modeFinancement?: MosCode;
  capaciteAccueil?: CapaciteAccueil;
  capaciteAdaptation?: CapaciteAdaptation;
  metadonnee?: MosMetadata;
}

export interface Autorisation {
  identifiants?: MosIdentifier[];
  activitesSoinAutorisees?: ActiviteSoinAutorisee[];
  autresActivitesAutorisees?: AutreActiviteSoumiseAutorisation[];
  activitesSoumisesReconnaissance?: ActiviteSoumiseReconnaissance[];
  activitesEnseignement?: ActiviteEnseignement[];
  activitesSociales?: ActiviteSociale[];
  equipementsMaterielsLourds?: EquipementMaterielLourd[];
  capacitesActivites?: CapaciteActiviteExerce[];
  metadonnee?: MosMetadata;
}

const sanitizeIdentifiant = (value?: MosIdentifier) =>
  value ? IdentifierSerializer.toDocument(value) : undefined;

const sanitizeCode = (value?: MosCode) =>
  value ? CodeSerializer.toDocument(value) : undefined;

const sanitizeDate = (value?: MosDate) =>
  value ? DateSerializer.toDocument(value) : undefined;

const sanitizeIndicator = (value?: MosIndicator) =>
  value ? IndicatorSerializer.toDocument(value) : undefined;

const sanitizeText = (value?: MosText) => (value ? TextSerializer.toDocument(value) : undefined);

const sanitizeActiviteSoinAutorisee = (value: ActiviteSoinAutorisee): ActiviteSoinAutorisee =>
  stripUndefined({
    ...value,
    numeroAutorisation: sanitizeIdentifiant(value.numeroAutorisation),
    dateDecision: sanitizeDate(value.dateDecision),
    activite: sanitizeCode(value.activite),
    modalite: sanitizeCode(value.modalite),
    mode: sanitizeCode(value.mode),
    datePremiereMiseEnOeuvre: sanitizeDate(value.datePremiereMiseEnOeuvre),
    dateFin: sanitizeDate(value.dateFin),
    suppressionAutorisation: sanitizeIndicator(value.suppressionAutorisation),
    suspensionAutorisation: sanitizeIndicator(value.suspensionAutorisation),
    metadonnee: value.metadonnee ? MetadataSerializer.toDocument(value.metadonnee) : undefined,
  });

const sanitizeAutreActivite = (
  value: AutreActiviteSoumiseAutorisation,
): AutreActiviteSoumiseAutorisation =>
  stripUndefined({
    ...value,
    numeroAutorisation: sanitizeIdentifiant(value.numeroAutorisation),
    dateDecision: sanitizeDate(value.dateDecision),
    activite: sanitizeCode(value.activite),
    modalite: sanitizeCode(value.modalite),
    forme: sanitizeCode(value.forme),
    mode: sanitizeCode(value.mode),
    datePremiereMiseEnOeuvre: sanitizeDate(value.datePremiereMiseEnOeuvre),
    dateFin: sanitizeDate(value.dateFin),
    metadonnee: value.metadonnee ? MetadataSerializer.toDocument(value.metadonnee) : undefined,
  });

const sanitizeActiviteReconnaissance = (
  value: ActiviteSoumiseReconnaissance,
): ActiviteSoumiseReconnaissance =>
  stripUndefined({
    ...value,
    numeroReconnaissance: sanitizeIdentifiant(value.numeroReconnaissance),
    dateDecision: sanitizeDate(value.dateDecision),
    modalite: sanitizeCode(value.modalite),
    code: sanitizeCode(value.code),
    forme: sanitizeCode(value.forme),
    numeroCertification: sanitizeIdentifiant(value.numeroCertification),
    dateCertification: sanitizeDate(value.dateCertification),
    indicateurReconnaissanceRegionale: sanitizeIndicator(value.indicateurReconnaissanceRegionale),
    metadonnee: value.metadonnee ? MetadataSerializer.toDocument(value.metadonnee) : undefined,
  });

const sanitizeActiviteEnseignement = (value: ActiviteEnseignement): ActiviteEnseignement =>
  stripUndefined({
    ...value,
    agregatDisciplineNiveau1: sanitizeCode(value.agregatDisciplineNiveau1),
    agregatDisciplineNiveau2: sanitizeCode(value.agregatDisciplineNiveau2),
    agregatDisciplineNiveau3: sanitizeCode(value.agregatDisciplineNiveau3),
    discipline: sanitizeCode(value.discipline),
    modeFonctionnement: sanitizeCode(value.modeFonctionnement),
    dateAutorisation: sanitizeDate(value.dateAutorisation),
    suppressionAutorisation: sanitizeIndicator(value.suppressionAutorisation),
    metadonnee: value.metadonnee ? MetadataSerializer.toDocument(value.metadonnee) : undefined,
  });

const sanitizeCapaciteActiviteExerce = (
  value: CapaciteActiviteExerce,
): CapaciteActiviteExerce =>
  stripUndefined({
    ...value,
    habilitationAideSociale: sanitizeCode(value.habilitationAideSociale),
    modeFinancement: sanitizeCode(value.modeFinancement),
    capaciteAccueil: value.capaciteAccueil
      ? CapaciteAccueilSerializer.toDocument(value.capaciteAccueil)
      : undefined,
    capaciteAdaptation: value.capaciteAdaptation
      ? CapaciteAdaptationSerializer.toDocument(value.capaciteAdaptation)
      : undefined,
    metadonnee: value.metadonnee ? MetadataSerializer.toDocument(value.metadonnee) : undefined,
  });

const sanitizeActiviteSociale = (value: ActiviteSociale): ActiviteSociale =>
  stripUndefined({
    ...value,
    dateAutorisation: sanitizeDate(value.dateAutorisation),
    dateMiseAJourAutorisation: sanitizeDate(value.dateMiseAJourAutorisation),
    dateDerniereInstallation: sanitizeDate(value.dateDerniereInstallation),
    dateFinAutorisation: sanitizeDate(value.dateFinAutorisation),
    dateSuspensionAutorisation: sanitizeDate(value.dateSuspensionAutorisation),
    agregatDisciplineNiveau1: sanitizeCode(value.agregatDisciplineNiveau1),
    agregatDisciplineNiveau2: sanitizeCode(value.agregatDisciplineNiveau2),
    agregatDisciplineNiveau3: sanitizeCode(value.agregatDisciplineNiveau3),
    discipline: sanitizeCode(value.discipline),
    agrémentNational: sanitizeCode(value.agrémentNational),
    agrémentRegional: sanitizeCode(value.agrémentRegional),
    sourceReconnaissance: sanitizeCode(value.sourceReconnaissance),
    sourceInternationalisation: sanitizeCode(value.sourceInternationalisation),
    capaciteActivite: value.capaciteActivite ? sanitizeCapaciteActiviteExerce(value.capaciteActivite) : undefined,
    metadonnee: value.metadonnee ? MetadataSerializer.toDocument(value.metadonnee) : undefined,
  });

const sanitizeEquipementMaterielLourd = (value: EquipementMaterielLourd): EquipementMaterielLourd =>
  stripUndefined({
    ...value,
    numeroAutorisation: sanitizeIdentifiant(value.numeroAutorisation),
    equipement: sanitizeCode(value.equipement),
    dateDecision: sanitizeDate(value.dateDecision),
    datePremiereMiseEnOeuvre: sanitizeDate(value.datePremiereMiseEnOeuvre),
    dateFin: sanitizeDate(value.dateFin),
    numeroSerie: sanitizeText(value.numeroSerie),
    marque: sanitizeText(value.marque),
    modele: sanitizeText(value.modele),
    suppressionAutorisation: sanitizeIndicator(value.suppressionAutorisation),
    metadonnee: value.metadonnee ? MetadataSerializer.toDocument(value.metadonnee) : undefined,
  });

const sanitizeAutorisation = (value: Autorisation): Autorisation =>
  stripUndefined({
    ...value,
    identifiants: value.identifiants?.map(IdentifierSerializer.toDocument),
    activitesSoinAutorisees: value.activitesSoinAutorisees?.map(sanitizeActiviteSoinAutorisee),
    autresActivitesAutorisees: value.autresActivitesAutorisees?.map(sanitizeAutreActivite),
    activitesSoumisesReconnaissance: value.activitesSoumisesReconnaissance?.map(
      sanitizeActiviteReconnaissance,
    ),
    activitesEnseignement: value.activitesEnseignement?.map(sanitizeActiviteEnseignement),
    activitesSociales: value.activitesSociales?.map(sanitizeActiviteSociale),
    equipementsMaterielsLourds: value.equipementsMaterielsLourds?.map(sanitizeEquipementMaterielLourd),
    capacitesActivites: value.capacitesActivites?.map(sanitizeCapaciteActiviteExerce),
    metadonnee: value.metadonnee ? MetadataSerializer.toDocument(value.metadonnee) : undefined,
  });

export interface AutorisationDocument extends Autorisation {
  _id: ObjectId;
}

export interface AutorisationDto extends Autorisation {
  id: string;
}

export const AUTORISATIONS_COLLECTION = "autorisations";

export const AutorisationSerializer = {
  toDocument(input: Autorisation): Autorisation {
    return sanitizeAutorisation(input);
  },
  fromDocument(document: AutorisationDocument): AutorisationDto {
    const { _id, ...rest } = document;
    const base = sanitizeAutorisation(rest);
    return {
      id: _id.toHexString(),
      ...base,
    };
  },
  sanitize: sanitizeAutorisation,
};
