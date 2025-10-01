/**
 * Types de données de base décrits dans le MOS.
 */
export interface MosCode {
  valeur: string;
  libelle?: string;
  langue?: string;
  identifiantNomenclature?: string;
  nomNomenclature?: string;
  versionNomenclature?: string;
  urnNomenclature?: string;
  identifiantAgence?: string;
  nomAgence?: string;
}

export interface MosText {
  valeur: string;
  langue?: string;
}

export interface MosDate {
  valeur: string;
  format?: string;
}

export interface MosDateTime {
  valeur: string;
  format?: string;
}

export interface MosMeasure {
  valeur: number;
  uniteMesure?: MosCode;
  comparateur?: MosCode;
  nomSystemeUniteMesure?: string;
}

export interface MosIdentifier {
  valeur: string;
  qualification?: string;
  identifiantSysteme?: string;
  nomSysteme?: string;
  versionSysteme?: string;
  uriSysteme?: string;
  identifiantAgence?: string;
  nomAgence?: string;
  typeIdentifiant?: MosCode;
}

export interface MosMetadataAuthority {
  identifiant: string;
  nom?: string;
  type?: string;
}

export interface MosMetadata {
  identifiant?: MosIdentifier[];
  version?: MosText;
  commentaire?: MosText;
  dateCreation?: MosDateTime;
  dateMiseJour?: MosDateTime;
  dateFin?: MosDateTime;
  autoriteEnregistrementResponsable?: MosMetadataAuthority[];
}

export interface MosLangueParlee {
  langueParlee?: MosCode;
  dateFin?: MosDate;
  metadonnee?: MosMetadata;
}

export type MosConceptCode = MosCode;

export interface MosIndicator {
  valeur: boolean;
  metadonnee?: MosMetadata;
}

export interface MosAdresse {
  typeAdresse?: MosCode;
  lignes?: MosText[];
  codePostal?: string;
  commune?: MosText;
  pays?: MosCode;
  complement?: MosText;
  metadonnee?: MosMetadata;
}

export interface MosTelecommunication {
  systeme: MosCode;
  usage?: MosCode;
  valeur: string;
  preference?: number;
  metadonnee?: MosMetadata;
}

export interface MosBoiteLettreMSS {
  adresse: string;
  usage?: MosCode;
  organisation?: MosText;
  metadonnee?: MosMetadata;
}

export interface MosDiplome {
  typeDiplome?: MosCode;
  intitule?: MosText;
  dateObtention?: MosDate;
  autoriteDelivrance?: MosText;
  metadonnee?: MosMetadata;
}

export interface MosHoraire {
  jour?: MosCode;
  heureDebut?: MosText;
  heureFin?: MosText;
  commentaire?: MosText;
  metadonnee?: MosMetadata;
}

export interface MosNumeric {
  valeur: number;
  metadonnee?: MosMetadata;
}

export interface MosCapacity {
  nature?: MosCode;
  statut?: MosCode;
  temporalite?: MosCode;
  nombreCapacite?: MosNumeric;
  precision?: MosText;
  variation?: MosNumeric;
  typeSourceCapacite?: MosCode;
  dateMiseAJourCapacite?: MosDate;
  dateConstatCapacite?: MosDate;
  metadonnee?: MosMetadata;
}

export interface MosCapacityClosed extends MosCapacity {
  typeFermetureCapacite?: MosCode;
}

export interface MosCapacitySupplementary extends MosCapacity {
  typeLitsSupplementaire?: MosCode;
  typeCrise?: MosCode;
}

export interface MosCapacityInstalled extends MosCapacity {
  anneeReference?: MosDate;
}

export interface MosCapacityAvailable extends MosCapacity {
  genreConcerne?: MosCode;
}

export interface CarteProfessionnel {
  typeCarte?: MosCode;
  numeroCarte?: MosText;
  dateDebutValidite?: MosDateTime;
  dateFinValidite?: MosDateTime;
  dateOpposition?: MosDateTime;
  metadonnee?: MosMetadata;
}

export interface Certificat {
  numeroSerie?: MosText;
  aneNiveau?: MosText;
  dnsSujet?: MosText;
  dateDebutValidite?: MosDateTime;
  dateFinValidite?: MosDateTime;
  usage?: MosCode;
  domaine?: MosText;
  adresseEmail?: MosTelecommunication;
  usageProfessionnel?: MosCode;
  typeCarte?: MosCode;
  identifiant?: MosIdentifier;
  valeurPublique?: MosText;
  statutPublication?: MosText;
  metadonnee?: MosMetadata;
}

export interface DispositifAuthentification {
  cartes?: CarteProfessionnel[];
  certificats?: Certificat[];
}

export interface MosCodePersisted extends MosCode {
  _id?: string;
}

export interface MosTextPersisted extends MosText {
  _id?: string;
}

export interface MosDatePersisted extends MosDate {
  _id?: string;
}

export interface MosDateTimePersisted extends MosDateTime {
  _id?: string;
}

export interface MosMeasurePersisted extends MosMeasure {
  _id?: string;
}

export interface MosIdentifierPersisted extends MosIdentifier {
  _id?: string;
}

export interface MosMetadataPersisted extends MosMetadata {
  _id?: string;
}

export interface MosLangueParleePersisted extends MosLangueParlee {
  _id?: string;
}

export interface MosIndicatorPersisted extends MosIndicator {
  _id?: string;
}

export interface MosNumericPersisted extends MosNumeric {
  _id?: string;
}

export interface MosCapacityPersisted extends MosCapacity {
  _id?: string;
}

export type BasePersistedType =
  | MosCodePersisted
  | MosTextPersisted
  | MosDatePersisted
  | MosDateTimePersisted
  | MosMeasurePersisted
  | MosIdentifierPersisted
  | MosMetadataPersisted
  | MosLangueParleePersisted
  | MosIndicatorPersisted
  | MosNumericPersisted
  | MosCapacityPersisted;
