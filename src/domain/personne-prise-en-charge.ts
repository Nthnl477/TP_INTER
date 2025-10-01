import { ObjectId } from "mongodb";
import {
  AdresseSerializer,
  CodeSerializer,
  DateSerializer,
  DateTimeSerializer,
  DiplomeSerializer,
  IdentifierSerializer,
  IndicatorSerializer,
  MeasureSerializer,
  MetadataSerializer,
  TelecommunicationSerializer,
  TextSerializer,
} from "./serialization";
import {
  MosAdresse,
  MosCode,
  MosDate,
  MosDateTime,
  MosDiplome,
  MosIdentifier,
  MosIndicator,
  MosMeasure,
  MosMetadata,
  MosTelecommunication,
  MosText,
} from "./types";
import { PersonnePhysique, PersonnePhysiqueSerializer } from "./personne-physique";
import { stripUndefined } from "./utils";

export interface INS {
  matricule?: MosIdentifier;
  nomNaissance?: MosText;
  listePrenomsNaissance?: MosText[];
  sexe?: MosCode;
  dateNaissance?: MosDateTime;
  lieuNaissance?: MosText;
  premierPrenomNaissance?: MosText;
  prenomUtilise?: MosText;
  metadonnee?: MosMetadata;
}

export interface Contact {
  relation?: MosCode;
  personne?: PersonnePhysique;
  organisation?: MosText;
  telecommunication?: MosTelecommunication[];
  adresses?: MosAdresse[];
  metadonnee?: MosMetadata;
}

export interface VieQuotidienne {
  situationVieQuotidienne?: MosCode[];
  besoinVieQuotidienne?: MosCode;
  compositionFoyer?: MosCode;
  metadonnee?: MosMetadata;
}

export interface VieProfessionnelle {
  dejaTravaille?: MosIndicator;
  diplome?: MosDiplome;
  situationVieProfessionnelle?: MosCode;
  situationSansEmploi?: MosCode;
  besoinProfessionnel?: MosCode;
  metadonnee?: MosMetadata;
}

export interface VieSociale {
  typeSocialisation?: MosCode;
  besoinSocial?: MosCode;
  metadonnee?: MosMetadata;
}

export interface VieScolaire {
  typeScolarisation?: MosCode;
  besoinScolaire?: MosCode;
  metadonnee?: MosMetadata;
}

export interface ArretTravail {
  dateDebutArret?: MosDate;
  motifArret?: MosCode;
  rencontreServiceSocial?: MosIndicator;
  dateRencontreServiceSocial?: MosDate;
  rencontreMedecin?: MosIndicator;
  dateRencontreMedecin?: MosDate;
  metadonnee?: MosMetadata;
}

export interface Emploi {
  libelleEmploi?: MosText;
  dateDebutEmploi?: MosDate;
  dateFinEmploi?: MosDate;
  statutEmploi?: MosCode;
  emploiAdapteHandicap?: MosIndicator;
  metadonnee?: MosMetadata;
}

export interface PlageReference {
  borneInferieure?: MosMeasure;
  borneSuperieure?: MosMeasure;
  type?: MosCode;
  trancheAge?: MosCode;
  guideTexte?: MosText;
  metadonnee?: MosMetadata;
}

export interface ResultatObservation {
  type?: MosCode[];
  valeur?: MosMeasure;
  interpretation?: MosCode;
  raisonAbsence?: MosCode;
  metadonnee?: MosMetadata;
  plagesReference?: PlageReference[];
}

export interface Observation {
  identifiant?: MosIdentifier;
  statut?: MosCode;
  categorie?: MosCode;
  code?: MosCode;
  datePertinence?: MosDate;
  dateDisponibilite?: MosDateTime;
  commentaire?: MosText;
  siteAnatomique?: MosCode;
  methode?: MosCode;
  positionCorps?: MosCode;
  momentMesure?: MosCode;
  niveauEffort?: MosCode;
  typeLaboratoire?: MosCode;
  nombreJours?: MosCode;
  resultat?: ResultatObservation[];
  metadonnee?: MosMetadata;
}

export interface PersonnePriseCharge {
  ins?: INS;
  idPersonnePriseCharge?: MosIdentifier[];
  personne?: PersonnePhysique;
  preferenceCommunication?: MosCode;
  contacts?: Contact[];
  adressesCorrespondance?: MosAdresse[];
  telecommunication?: MosTelecommunication[];
  vieQuotidienne?: VieQuotidienne;
  vieProfessionnelle?: VieProfessionnelle;
  vieSociale?: VieSociale;
  vieScolaire?: VieScolaire;
  arretTravail?: ArretTravail;
  emplois?: Emploi[];
  observations?: Observation[];
  metadonnee?: MosMetadata;
}

export interface PersonnePriseChargeDocument extends PersonnePriseCharge {
  _id: ObjectId;
}

export interface PersonnePriseChargeDto extends PersonnePriseCharge {
  id: string;
}

export const PERSONNE_PRISE_CHARGE_COLLECTION = "personnesPrisesEnCharge";

const mapCodes = (values?: MosCode[]) => values?.map(CodeSerializer.toDocument);

const sanitizeINS = (value: INS): INS =>
  stripUndefined({
    ...value,
    matricule: value.matricule ? IdentifierSerializer.toDocument(value.matricule) : undefined,
    nomNaissance: value.nomNaissance ? TextSerializer.toDocument(value.nomNaissance) : undefined,
    listePrenomsNaissance: value.listePrenomsNaissance?.map(TextSerializer.toDocument),
    sexe: value.sexe ? CodeSerializer.toDocument(value.sexe) : undefined,
    dateNaissance: value.dateNaissance ? DateTimeSerializer.toDocument(value.dateNaissance) : undefined,
    lieuNaissance: value.lieuNaissance ? TextSerializer.toDocument(value.lieuNaissance) : undefined,
    premierPrenomNaissance: value.premierPrenomNaissance
      ? TextSerializer.toDocument(value.premierPrenomNaissance)
      : undefined,
    prenomUtilise: value.prenomUtilise ? TextSerializer.toDocument(value.prenomUtilise) : undefined,
    metadonnee: value.metadonnee ? MetadataSerializer.toDocument(value.metadonnee) : undefined,
  });

const sanitizeContact = (value: Contact): Contact =>
  stripUndefined({
    ...value,
    relation: value.relation ? CodeSerializer.toDocument(value.relation) : undefined,
    personne: value.personne ? PersonnePhysiqueSerializer.toDocument(value.personne) : undefined,
    organisation: value.organisation ? TextSerializer.toDocument(value.organisation) : undefined,
    telecommunication: value.telecommunication?.map(TelecommunicationSerializer.toDocument),
    adresses: value.adresses?.map(AdresseSerializer.toDocument),
    metadonnee: value.metadonnee ? MetadataSerializer.toDocument(value.metadonnee) : undefined,
  });

const sanitizeVieQuotidienne = (value: VieQuotidienne): VieQuotidienne =>
  stripUndefined({
    ...value,
    situationVieQuotidienne: mapCodes(value.situationVieQuotidienne),
    besoinVieQuotidienne: value.besoinVieQuotidienne
      ? CodeSerializer.toDocument(value.besoinVieQuotidienne)
      : undefined,
    compositionFoyer: value.compositionFoyer ? CodeSerializer.toDocument(value.compositionFoyer) : undefined,
    metadonnee: value.metadonnee ? MetadataSerializer.toDocument(value.metadonnee) : undefined,
  });

const sanitizeVieProfessionnelle = (value: VieProfessionnelle): VieProfessionnelle =>
  stripUndefined({
    ...value,
    dejaTravaille: value.dejaTravaille ? IndicatorSerializer.toDocument(value.dejaTravaille) : undefined,
    diplome: value.diplome ? DiplomeSerializer.toDocument(value.diplome) : undefined,
    situationVieProfessionnelle: value.situationVieProfessionnelle
      ? CodeSerializer.toDocument(value.situationVieProfessionnelle)
      : undefined,
    situationSansEmploi: value.situationSansEmploi
      ? CodeSerializer.toDocument(value.situationSansEmploi)
      : undefined,
    besoinProfessionnel: value.besoinProfessionnel
      ? CodeSerializer.toDocument(value.besoinProfessionnel)
      : undefined,
    metadonnee: value.metadonnee ? MetadataSerializer.toDocument(value.metadonnee) : undefined,
  });

const sanitizeVieSociale = (value: VieSociale): VieSociale =>
  stripUndefined({
    ...value,
    typeSocialisation: value.typeSocialisation ? CodeSerializer.toDocument(value.typeSocialisation) : undefined,
    besoinSocial: value.besoinSocial ? CodeSerializer.toDocument(value.besoinSocial) : undefined,
    metadonnee: value.metadonnee ? MetadataSerializer.toDocument(value.metadonnee) : undefined,
  });

const sanitizeVieScolaire = (value: VieScolaire): VieScolaire =>
  stripUndefined({
    ...value,
    typeScolarisation: value.typeScolarisation ? CodeSerializer.toDocument(value.typeScolarisation) : undefined,
    besoinScolaire: value.besoinScolaire ? CodeSerializer.toDocument(value.besoinScolaire) : undefined,
    metadonnee: value.metadonnee ? MetadataSerializer.toDocument(value.metadonnee) : undefined,
  });

const sanitizeArretTravail = (value: ArretTravail): ArretTravail =>
  stripUndefined({
    ...value,
    dateDebutArret: value.dateDebutArret ? DateSerializer.toDocument(value.dateDebutArret) : undefined,
    motifArret: value.motifArret ? CodeSerializer.toDocument(value.motifArret) : undefined,
    rencontreServiceSocial: value.rencontreServiceSocial
      ? IndicatorSerializer.toDocument(value.rencontreServiceSocial)
      : undefined,
    dateRencontreServiceSocial: value.dateRencontreServiceSocial
      ? DateSerializer.toDocument(value.dateRencontreServiceSocial)
      : undefined,
    rencontreMedecin: value.rencontreMedecin
      ? IndicatorSerializer.toDocument(value.rencontreMedecin)
      : undefined,
    dateRencontreMedecin: value.dateRencontreMedecin
      ? DateSerializer.toDocument(value.dateRencontreMedecin)
      : undefined,
    metadonnee: value.metadonnee ? MetadataSerializer.toDocument(value.metadonnee) : undefined,
  });

const sanitizeEmploi = (value: Emploi): Emploi =>
  stripUndefined({
    ...value,
    libelleEmploi: value.libelleEmploi ? TextSerializer.toDocument(value.libelleEmploi) : undefined,
    dateDebutEmploi: value.dateDebutEmploi ? DateSerializer.toDocument(value.dateDebutEmploi) : undefined,
    dateFinEmploi: value.dateFinEmploi ? DateSerializer.toDocument(value.dateFinEmploi) : undefined,
    statutEmploi: value.statutEmploi ? CodeSerializer.toDocument(value.statutEmploi) : undefined,
    emploiAdapteHandicap: value.emploiAdapteHandicap
      ? IndicatorSerializer.toDocument(value.emploiAdapteHandicap)
      : undefined,
    metadonnee: value.metadonnee ? MetadataSerializer.toDocument(value.metadonnee) : undefined,
  });

const sanitizePlageReference = (value: PlageReference): PlageReference =>
  stripUndefined({
    ...value,
    borneInferieure: value.borneInferieure ? MeasureSerializer.toDocument(value.borneInferieure) : undefined,
    borneSuperieure: value.borneSuperieure ? MeasureSerializer.toDocument(value.borneSuperieure) : undefined,
    type: value.type ? CodeSerializer.toDocument(value.type) : undefined,
    trancheAge: value.trancheAge ? CodeSerializer.toDocument(value.trancheAge) : undefined,
    guideTexte: value.guideTexte ? TextSerializer.toDocument(value.guideTexte) : undefined,
    metadonnee: value.metadonnee ? MetadataSerializer.toDocument(value.metadonnee) : undefined,
  });

const sanitizeResultatObservation = (value: ResultatObservation): ResultatObservation =>
  stripUndefined({
    ...value,
    type: mapCodes(value.type),
    valeur: value.valeur ? MeasureSerializer.toDocument(value.valeur) : undefined,
    interpretation: value.interpretation ? CodeSerializer.toDocument(value.interpretation) : undefined,
    raisonAbsence: value.raisonAbsence ? CodeSerializer.toDocument(value.raisonAbsence) : undefined,
    metadonnee: value.metadonnee ? MetadataSerializer.toDocument(value.metadonnee) : undefined,
    plagesReference: value.plagesReference?.map(sanitizePlageReference),
  });

const sanitizeObservation = (value: Observation): Observation =>
  stripUndefined({
    ...value,
    identifiant: value.identifiant ? IdentifierSerializer.toDocument(value.identifiant) : undefined,
    statut: value.statut ? CodeSerializer.toDocument(value.statut) : undefined,
    categorie: value.categorie ? CodeSerializer.toDocument(value.categorie) : undefined,
    code: value.code ? CodeSerializer.toDocument(value.code) : undefined,
    datePertinence: value.datePertinence ? DateSerializer.toDocument(value.datePertinence) : undefined,
    dateDisponibilite: value.dateDisponibilite
      ? DateTimeSerializer.toDocument(value.dateDisponibilite)
      : undefined,
    commentaire: value.commentaire ? TextSerializer.toDocument(value.commentaire) : undefined,
    siteAnatomique: value.siteAnatomique ? CodeSerializer.toDocument(value.siteAnatomique) : undefined,
    methode: value.methode ? CodeSerializer.toDocument(value.methode) : undefined,
    positionCorps: value.positionCorps ? CodeSerializer.toDocument(value.positionCorps) : undefined,
    momentMesure: value.momentMesure ? CodeSerializer.toDocument(value.momentMesure) : undefined,
    niveauEffort: value.niveauEffort ? CodeSerializer.toDocument(value.niveauEffort) : undefined,
    typeLaboratoire: value.typeLaboratoire ? CodeSerializer.toDocument(value.typeLaboratoire) : undefined,
    nombreJours: value.nombreJours ? CodeSerializer.toDocument(value.nombreJours) : undefined,
    resultat: value.resultat?.map(sanitizeResultatObservation),
    metadonnee: value.metadonnee ? MetadataSerializer.toDocument(value.metadonnee) : undefined,
  });

const sanitizePersonnePriseCharge = (value: PersonnePriseCharge): PersonnePriseCharge =>
  stripUndefined({
    ...value,
    ins: value.ins ? sanitizeINS(value.ins) : undefined,
    idPersonnePriseCharge: value.idPersonnePriseCharge?.map(IdentifierSerializer.toDocument),
    personne: value.personne ? PersonnePhysiqueSerializer.toDocument(value.personne) : undefined,
    preferenceCommunication: value.preferenceCommunication
      ? CodeSerializer.toDocument(value.preferenceCommunication)
      : undefined,
    contacts: value.contacts?.map(sanitizeContact),
    adressesCorrespondance: value.adressesCorrespondance?.map(AdresseSerializer.toDocument),
    telecommunication: value.telecommunication?.map(TelecommunicationSerializer.toDocument),
    vieQuotidienne: value.vieQuotidienne ? sanitizeVieQuotidienne(value.vieQuotidienne) : undefined,
    vieProfessionnelle: value.vieProfessionnelle
      ? sanitizeVieProfessionnelle(value.vieProfessionnelle)
      : undefined,
    vieSociale: value.vieSociale ? sanitizeVieSociale(value.vieSociale) : undefined,
    vieScolaire: value.vieScolaire ? sanitizeVieScolaire(value.vieScolaire) : undefined,
    arretTravail: value.arretTravail ? sanitizeArretTravail(value.arretTravail) : undefined,
    emplois: value.emplois?.map(sanitizeEmploi),
    observations: value.observations?.map(sanitizeObservation),
    metadonnee: value.metadonnee ? MetadataSerializer.toDocument(value.metadonnee) : undefined,
  });

export const PersonnePriseChargeSerializer = {
  toDocument(input: PersonnePriseCharge): PersonnePriseCharge {
    return sanitizePersonnePriseCharge(input);
  },
  fromDocument(document: PersonnePriseChargeDocument): PersonnePriseChargeDto {
    const { _id, ...rest } = document;
    const base = sanitizePersonnePriseCharge(rest);
    return {
      id: _id.toHexString(),
      ...base,
    };
  },
  sanitize: sanitizePersonnePriseCharge,
};
