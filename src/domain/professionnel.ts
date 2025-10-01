import { ObjectId } from "mongodb";
import {
  AdresseSerializer,
  BoiteLettreMSSSerializer,
  CodeSerializer,
  DateSerializer,
  DiplomeSerializer,
  HoraireSerializer,
  IdentifierSerializer,
  MetadataSerializer,
  TelecommunicationSerializer,
  TextSerializer,
} from "./serialization";
import {
  MosAdresse,
  MosBoiteLettreMSS,
  MosCode,
  MosDate,
  MosDiplome,
  MosHoraire,
  MosIdentifier,
  MosMetadata,
  MosTelecommunication,
  MosText,
  DispositifAuthentification,
} from "./types";
import { DispositifAuthentificationSerializer } from "./dispositif-authentification";
import { PersonnePhysique, PersonnePhysiqueSerializer } from "./personne-physique";
import { stripUndefined } from "./utils";

export interface SavoirFaire {
  typeSavoirFaire?: MosCode;
  dateDebut?: MosDate;
  dateFin?: MosDate;
  dateAbandon?: MosDate;
  metadonnee?: MosMetadata;
}

export interface InscriptionOrdre {
  ordre?: MosCode;
  codeDistinction?: MosCode;
  dateInscription?: MosDate;
  dateRadiation?: MosDate;
  metadonnee?: MosMetadata;
}

export interface AttributionParticuliere {
  attribution?: MosCode;
  dateDebutReconnaissance?: MosDate;
  dateFinReconnaissance?: MosDate;
  metadonnee?: MosMetadata;
}

export interface NiveauFormation {
  diplome?: MosDiplome;
  anneeUniversitaire?: MosCode;
  dateFin?: MosDate;
  metadonnee?: MosMetadata;
}

export interface SituationOperationnelle {
  identifiantSituationOperationnelle?: MosIdentifier;
  modeExerciceSite?: MosCode;
  competenceSpecifique?: MosCode;
  precisionHoraire?: MosHoraire;
  secteurConventionnement?: MosCode;
  optionContratAccesSoins?: MosCode;
  carteVitaleAcceptee?: MosCode;
  telecommunication?: MosTelecommunication[];
  metadonnee?: MosMetadata;
}

export interface SituationExercice {
  role?: MosCode;
  typeR?: MosCode;
  modeExercice?: MosCode;
  numeroAM?: MosIdentifier;
  dateDebutActivite?: MosDate;
  dateFinActivite?: MosDate;
  genreActivite?: MosCode;
  statutHospitalier?: MosCode;
  statutSSA?: MosCode;
  statutPharmacie?: MosCode;
  secteurPharmacie?: MosCode;
  sousSecteurPharmacie?: MosCode;
  typeActeLiberale?: MosCode;
  statutPS_SISA?: MosCode;
  telecommunication?: MosTelecommunication[];
  adresseSE?: MosAdresse;
  boitesLettresMSS?: MosBoiteLettreMSS[];
  metadonnee?: MosMetadata;
}

export interface ExerciceProfessionnel {
  civiliteExercice?: MosCode;
  nomExercice?: MosText;
  prenomExercice?: MosText;
  titreProfessionnel?: MosCode;
  categorieProfessionnelle?: MosCode;
  dateDebutExercice?: MosDate;
  dateFinExercice?: MosDate;
  diplomeReference?: MosDiplome;
  situationsOperationnelles?: SituationOperationnelle[];
  situationsExercice?: SituationExercice[];
  savoirFaire?: SavoirFaire[];
  inscriptionOrdre?: InscriptionOrdre;
  attributionsParticulieres?: AttributionParticuliere[];
  niveauxFormation?: NiveauFormation[];
  dispositifsAuthentification?: DispositifAuthentification[];
  metadonnee?: MosMetadata;
}

export interface Professionnel {
  idPP?: MosIdentifier;
  typeIdentifPP?: MosCode;
  idNatPS?: MosIdentifier;
  personne?: PersonnePhysique;
  diplomes?: MosDiplome[];
  adressesCorrespondance?: MosAdresse[];
  telecommunication?: MosTelecommunication[];
  boitesLettresMSS?: MosBoiteLettreMSS[];
  exercicesProfessionnels?: ExerciceProfessionnel[];
  metadonnee?: MosMetadata;
}

export interface ProfessionnelDocument extends Professionnel {
  _id: ObjectId;
}

export interface ProfessionnelDto extends Professionnel {
  id: string;
}

export const PROFESSIONNEL_COLLECTION = "professionnels";

const sanitizeSavoirFaire = (value: SavoirFaire): SavoirFaire =>
  stripUndefined({
    ...value,
    typeSavoirFaire: value.typeSavoirFaire
      ? CodeSerializer.toDocument(value.typeSavoirFaire)
      : undefined,
    dateDebut: value.dateDebut ? DateSerializer.toDocument(value.dateDebut) : undefined,
    dateFin: value.dateFin ? DateSerializer.toDocument(value.dateFin) : undefined,
    dateAbandon: value.dateAbandon ? DateSerializer.toDocument(value.dateAbandon) : undefined,
    metadonnee: value.metadonnee ? MetadataSerializer.toDocument(value.metadonnee) : undefined,
  });

const sanitizeInscriptionOrdre = (value: InscriptionOrdre): InscriptionOrdre =>
  stripUndefined({
    ...value,
    ordre: value.ordre ? CodeSerializer.toDocument(value.ordre) : undefined,
    codeDistinction: value.codeDistinction
      ? CodeSerializer.toDocument(value.codeDistinction)
      : undefined,
    dateInscription: value.dateInscription
      ? DateSerializer.toDocument(value.dateInscription)
      : undefined,
    dateRadiation: value.dateRadiation ? DateSerializer.toDocument(value.dateRadiation) : undefined,
    metadonnee: value.metadonnee ? MetadataSerializer.toDocument(value.metadonnee) : undefined,
  });

const sanitizeAttributionParticuliere = (
  value: AttributionParticuliere,
): AttributionParticuliere =>
  stripUndefined({
    ...value,
    attribution: value.attribution ? CodeSerializer.toDocument(value.attribution) : undefined,
    dateDebutReconnaissance: value.dateDebutReconnaissance
      ? DateSerializer.toDocument(value.dateDebutReconnaissance)
      : undefined,
    dateFinReconnaissance: value.dateFinReconnaissance
      ? DateSerializer.toDocument(value.dateFinReconnaissance)
      : undefined,
    metadonnee: value.metadonnee ? MetadataSerializer.toDocument(value.metadonnee) : undefined,
  });

const sanitizeNiveauFormation = (value: NiveauFormation): NiveauFormation =>
  stripUndefined({
    ...value,
    diplome: value.diplome ? DiplomeSerializer.toDocument(value.diplome) : undefined,
    anneeUniversitaire: value.anneeUniversitaire
      ? CodeSerializer.toDocument(value.anneeUniversitaire)
      : undefined,
    dateFin: value.dateFin ? DateSerializer.toDocument(value.dateFin) : undefined,
    metadonnee: value.metadonnee ? MetadataSerializer.toDocument(value.metadonnee) : undefined,
  });

const sanitizeSituationOperationnelle = (
  value: SituationOperationnelle,
): SituationOperationnelle =>
  stripUndefined({
    ...value,
    identifiantSituationOperationnelle: value.identifiantSituationOperationnelle
      ? IdentifierSerializer.toDocument(value.identifiantSituationOperationnelle)
      : undefined,
    modeExerciceSite: value.modeExerciceSite
      ? CodeSerializer.toDocument(value.modeExerciceSite)
      : undefined,
    competenceSpecifique: value.competenceSpecifique
      ? CodeSerializer.toDocument(value.competenceSpecifique)
      : undefined,
    precisionHoraire: value.precisionHoraire
      ? HoraireSerializer.toDocument(value.precisionHoraire)
      : undefined,
    secteurConventionnement: value.secteurConventionnement
      ? CodeSerializer.toDocument(value.secteurConventionnement)
      : undefined,
    optionContratAccesSoins: value.optionContratAccesSoins
      ? CodeSerializer.toDocument(value.optionContratAccesSoins)
      : undefined,
    carteVitaleAcceptee: value.carteVitaleAcceptee
      ? CodeSerializer.toDocument(value.carteVitaleAcceptee)
      : undefined,
    telecommunication: value.telecommunication?.map(TelecommunicationSerializer.toDocument),
    metadonnee: value.metadonnee ? MetadataSerializer.toDocument(value.metadonnee) : undefined,
  });

const sanitizeSituationExercice = (value: SituationExercice): SituationExercice =>
  stripUndefined({
    ...value,
    role: value.role ? CodeSerializer.toDocument(value.role) : undefined,
    typeR: value.typeR ? CodeSerializer.toDocument(value.typeR) : undefined,
    modeExercice: value.modeExercice ? CodeSerializer.toDocument(value.modeExercice) : undefined,
    numeroAM: value.numeroAM ? IdentifierSerializer.toDocument(value.numeroAM) : undefined,
    dateDebutActivite: value.dateDebutActivite
      ? DateSerializer.toDocument(value.dateDebutActivite)
      : undefined,
    dateFinActivite: value.dateFinActivite
      ? DateSerializer.toDocument(value.dateFinActivite)
      : undefined,
    genreActivite: value.genreActivite ? CodeSerializer.toDocument(value.genreActivite) : undefined,
    statutHospitalier: value.statutHospitalier
      ? CodeSerializer.toDocument(value.statutHospitalier)
      : undefined,
    statutSSA: value.statutSSA ? CodeSerializer.toDocument(value.statutSSA) : undefined,
    statutPharmacie: value.statutPharmacie
      ? CodeSerializer.toDocument(value.statutPharmacie)
      : undefined,
    secteurPharmacie: value.secteurPharmacie
      ? CodeSerializer.toDocument(value.secteurPharmacie)
      : undefined,
    sousSecteurPharmacie: value.sousSecteurPharmacie
      ? CodeSerializer.toDocument(value.sousSecteurPharmacie)
      : undefined,
    typeActeLiberale: value.typeActeLiberale
      ? CodeSerializer.toDocument(value.typeActeLiberale)
      : undefined,
    statutPS_SISA: value.statutPS_SISA ? CodeSerializer.toDocument(value.statutPS_SISA) : undefined,
    telecommunication: value.telecommunication?.map(TelecommunicationSerializer.toDocument),
    adresseSE: value.adresseSE ? AdresseSerializer.toDocument(value.adresseSE) : undefined,
    boitesLettresMSS: value.boitesLettresMSS?.map(BoiteLettreMSSSerializer.toDocument),
    metadonnee: value.metadonnee ? MetadataSerializer.toDocument(value.metadonnee) : undefined,
  });

const sanitizeExerciceProfessionnel = (
  value: ExerciceProfessionnel,
): ExerciceProfessionnel =>
  stripUndefined({
    ...value,
    civiliteExercice: value.civiliteExercice
      ? CodeSerializer.toDocument(value.civiliteExercice)
      : undefined,
    nomExercice: value.nomExercice ? TextSerializer.toDocument(value.nomExercice) : undefined,
    prenomExercice: value.prenomExercice
      ? TextSerializer.toDocument(value.prenomExercice)
      : undefined,
    titreProfessionnel: value.titreProfessionnel
      ? CodeSerializer.toDocument(value.titreProfessionnel)
      : undefined,
    categorieProfessionnelle: value.categorieProfessionnelle
      ? CodeSerializer.toDocument(value.categorieProfessionnelle)
      : undefined,
    dateDebutExercice: value.dateDebutExercice
      ? DateSerializer.toDocument(value.dateDebutExercice)
      : undefined,
    dateFinExercice: value.dateFinExercice
      ? DateSerializer.toDocument(value.dateFinExercice)
      : undefined,
    diplomeReference: value.diplomeReference
      ? DiplomeSerializer.toDocument(value.diplomeReference)
      : undefined,
    situationsOperationnelles: value.situationsOperationnelles?.map(sanitizeSituationOperationnelle),
    situationsExercice: value.situationsExercice?.map(sanitizeSituationExercice),
    savoirFaire: value.savoirFaire?.map(sanitizeSavoirFaire),
    inscriptionOrdre: value.inscriptionOrdre
      ? sanitizeInscriptionOrdre(value.inscriptionOrdre)
      : undefined,
    attributionsParticulieres: value.attributionsParticulieres?.map(
      sanitizeAttributionParticuliere,
    ),
    niveauxFormation: value.niveauxFormation?.map(sanitizeNiveauFormation),
    dispositifsAuthentification: value.dispositifsAuthentification?.map(
      DispositifAuthentificationSerializer.toDocument,
    ),
    metadonnee: value.metadonnee ? MetadataSerializer.toDocument(value.metadonnee) : undefined,
  });

const sanitizeProfessionnel = (value: Professionnel): Professionnel =>
  stripUndefined({
    ...value,
    idPP: value.idPP ? IdentifierSerializer.toDocument(value.idPP) : undefined,
    typeIdentifPP: value.typeIdentifPP ? CodeSerializer.toDocument(value.typeIdentifPP) : undefined,
    idNatPS: value.idNatPS ? IdentifierSerializer.toDocument(value.idNatPS) : undefined,
    personne: value.personne ? PersonnePhysiqueSerializer.toDocument(value.personne) : undefined,
    diplomes: value.diplomes?.map(DiplomeSerializer.toDocument),
    adressesCorrespondance: value.adressesCorrespondance?.map(AdresseSerializer.toDocument),
    telecommunication: value.telecommunication?.map(TelecommunicationSerializer.toDocument),
    boitesLettresMSS: value.boitesLettresMSS?.map(BoiteLettreMSSSerializer.toDocument),
    exercicesProfessionnels: value.exercicesProfessionnels?.map(sanitizeExerciceProfessionnel),
    metadonnee: value.metadonnee ? MetadataSerializer.toDocument(value.metadonnee) : undefined,
  });

export const ProfessionnelSerializer = {
  toDocument(input: Professionnel): Professionnel {
    return sanitizeProfessionnel(input);
  },
  fromDocument(document: ProfessionnelDocument): ProfessionnelDto {
    const { _id, ...rest } = document;
    const base = sanitizeProfessionnel(rest);
    return {
      id: _id.toHexString(),
      ...base,
    };
  },
  sanitize: sanitizeProfessionnel,
};
