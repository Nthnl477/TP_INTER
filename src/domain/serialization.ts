import { ObjectId } from "mongodb";
import {
  MosAdresse,
  MosBoiteLettreMSS,
  MosCapacity,
  MosCode,
  MosDate,
  MosDateTime,
  MosDiplome,
  MosHoraire,
  MosIdentifier,
  MosIndicator,
  MosLangueParlee,
  MosMeasure,
  MosMetadata,
  MosMetadataAuthority,
  MosNumeric,
  MosTelecommunication,
  MosText,
} from "./types";
import { stripUndefined } from "./utils";

type WithId<T> = T & { id: string };

const sanitizeCode = (value: MosCode): MosCode =>
  stripUndefined({
    ...value,
    valeur: value.valeur,
  });

const sanitizeOptionalCode = (value?: MosCode): MosCode | undefined =>
  value ? sanitizeCode(value) : undefined;

const sanitizeText = (value: MosText): MosText =>
  stripUndefined({
    ...value,
    valeur: value.valeur,
  });

const sanitizeOptionalText = (value?: MosText): MosText | undefined =>
  value ? sanitizeText(value) : undefined;

const sanitizeDate = (value: MosDate): MosDate =>
  stripUndefined({
    ...value,
    valeur: value.valeur,
  });

const sanitizeOptionalDate = (value?: MosDate): MosDate | undefined =>
  value ? sanitizeDate(value) : undefined;

const sanitizeDateTime = (value: MosDateTime): MosDateTime =>
  stripUndefined({
    ...value,
    valeur: value.valeur,
  });

const sanitizeOptionalDateTime = (value?: MosDateTime): MosDateTime | undefined =>
  value ? sanitizeDateTime(value) : undefined;

const sanitizeMeasure = (value: MosMeasure): MosMeasure =>
  stripUndefined({
    ...value,
    uniteMesure: sanitizeOptionalCode(value.uniteMesure),
    comparateur: sanitizeOptionalCode(value.comparateur),
  });

const sanitizeIdentifier = (value: MosIdentifier): MosIdentifier =>
  stripUndefined({
    ...value,
    valeur: value.valeur,
    typeIdentifiant: sanitizeOptionalCode(value.typeIdentifiant),
  });

const sanitizeMetadataAuthority = (
  value?: MosMetadataAuthority,
): MosMetadataAuthority | undefined =>
  value
    ? stripUndefined({
        ...value,
        identifiant: value.identifiant,
      })
    : undefined;

const sanitizeMetadata = (value: MosMetadata): MosMetadata =>
  stripUndefined({
    ...value,
    identifiant: value.identifiant?.map(sanitizeIdentifier),
    version: sanitizeOptionalText(value.version),
    commentaire: sanitizeOptionalText(value.commentaire),
    dateCreation: sanitizeOptionalDateTime(value.dateCreation),
    dateMiseJour: sanitizeOptionalDateTime(value.dateMiseJour),
    dateFin: sanitizeOptionalDateTime(value.dateFin),
    autoriteEnregistrementResponsable: value.autoriteEnregistrementResponsable
      ? value.autoriteEnregistrementResponsable
          .map(sanitizeMetadataAuthority)
          .filter((item): item is MosMetadataAuthority => Boolean(item))
      : undefined,
  });

const sanitizeLangueParlee = (value: MosLangueParlee): MosLangueParlee =>
  stripUndefined({
    ...value,
    langueParlee: sanitizeOptionalCode(value.langueParlee),
    dateFin: sanitizeOptionalDate(value.dateFin),
    metadonnee: value.metadonnee ? sanitizeMetadata(value.metadonnee) : undefined,
  });

const sanitizeTextArray = (values?: MosText[]): MosText[] | undefined =>
  values ? values.map(sanitizeText) : undefined;

const sanitizeIndicator = (value: MosIndicator): MosIndicator =>
  stripUndefined({
    ...value,
    valeur: value.valeur,
    metadonnee: value.metadonnee ? sanitizeMetadata(value.metadonnee) : undefined,
  });

const sanitizeNumeric = (value: MosNumeric): MosNumeric =>
  stripUndefined({
    ...value,
    metadonnee: value.metadonnee ? sanitizeMetadata(value.metadonnee) : undefined,
  });

const sanitizeCapacity = (value: MosCapacity): MosCapacity =>
  stripUndefined({
    ...value,
    nature: sanitizeOptionalCode(value.nature),
    statut: sanitizeOptionalCode(value.statut),
    temporalite: sanitizeOptionalCode(value.temporalite),
    nombreCapacite: value.nombreCapacite ? sanitizeNumeric(value.nombreCapacite) : undefined,
    precision: sanitizeOptionalText(value.precision),
    variation: value.variation ? sanitizeNumeric(value.variation) : undefined,
    typeSourceCapacite: sanitizeOptionalCode(value.typeSourceCapacite),
    dateMiseAJourCapacite: sanitizeOptionalDate(value.dateMiseAJourCapacite),
    dateConstatCapacite: sanitizeOptionalDate(value.dateConstatCapacite),
    metadonnee: value.metadonnee ? sanitizeMetadata(value.metadonnee) : undefined,
  });

const sanitizeAdresse = (value: MosAdresse): MosAdresse =>
  stripUndefined({
    ...value,
    typeAdresse: sanitizeOptionalCode(value.typeAdresse),
    lignes: sanitizeTextArray(value.lignes),
    commune: sanitizeOptionalText(value.commune),
    pays: sanitizeOptionalCode(value.pays),
    complement: sanitizeOptionalText(value.complement),
    metadonnee: value.metadonnee ? sanitizeMetadata(value.metadonnee) : undefined,
  });

const sanitizeTelecommunication = (value: MosTelecommunication): MosTelecommunication =>
  stripUndefined({
    ...value,
    systeme: sanitizeCode(value.systeme),
    usage: sanitizeOptionalCode(value.usage),
    metadonnee: value.metadonnee ? sanitizeMetadata(value.metadonnee) : undefined,
  });

const sanitizeBoiteLettreMSS = (value: MosBoiteLettreMSS): MosBoiteLettreMSS =>
  stripUndefined({
    ...value,
    usage: sanitizeOptionalCode(value.usage),
    organisation: sanitizeOptionalText(value.organisation),
    metadonnee: value.metadonnee ? sanitizeMetadata(value.metadonnee) : undefined,
  });

const sanitizeDiplome = (value: MosDiplome): MosDiplome =>
  stripUndefined({
    ...value,
    typeDiplome: sanitizeOptionalCode(value.typeDiplome),
    intitule: sanitizeOptionalText(value.intitule),
    dateObtention: sanitizeOptionalDate(value.dateObtention),
    autoriteDelivrance: sanitizeOptionalText(value.autoriteDelivrance),
    metadonnee: value.metadonnee ? sanitizeMetadata(value.metadonnee) : undefined,
  });

const sanitizeHoraire = (value: MosHoraire): MosHoraire =>
  stripUndefined({
    ...value,
    jour: sanitizeOptionalCode(value.jour),
    heureDebut: sanitizeOptionalText(value.heureDebut),
    heureFin: sanitizeOptionalText(value.heureFin),
    commentaire: sanitizeOptionalText(value.commentaire),
    metadonnee: value.metadonnee ? sanitizeMetadata(value.metadonnee) : undefined,
  });

function toDto<TDocument extends { _id: ObjectId }, TBase extends object>(
  document: TDocument,
  sanitize: (value: Omit<TDocument, "_id">) => TBase,
): WithId<TBase> {
  const { _id, ...rest } = document;
  const sanitized = sanitize(rest as Omit<TDocument, "_id">);
  return {
    ...sanitized,
    id: _id.toHexString(),
  } as WithId<TBase>;
}

export interface CodeDocument extends MosCode {
  _id: ObjectId;
}

export interface TextDocument extends MosText {
  _id: ObjectId;
}

export interface DateDocument extends MosDate {
  _id: ObjectId;
}

export interface DateTimeDocument extends MosDateTime {
  _id: ObjectId;
}

export interface MeasureDocument extends MosMeasure {
  _id: ObjectId;
}

export interface IdentifierDocument extends MosIdentifier {
  _id: ObjectId;
}

export interface MetadataDocument extends MosMetadata {
  _id: ObjectId;
}

export interface LangueParleeDocument extends MosLangueParlee {
  _id: ObjectId;
}

export interface AdresseDocument extends MosAdresse {
  _id: ObjectId;
}

export interface IndicatorDocument extends MosIndicator {
  _id: ObjectId;
}

export interface NumericDocument extends MosNumeric {
  _id: ObjectId;
}

export interface CapacityDocument extends MosCapacity {
  _id: ObjectId;
}

export interface TelecommunicationDocument extends MosTelecommunication {
  _id: ObjectId;
}

export interface BoiteLettreMSSDocument extends MosBoiteLettreMSS {
  _id: ObjectId;
}

export interface DiplomeDocument extends MosDiplome {
  _id: ObjectId;
}

export interface HoraireDocument extends MosHoraire {
  _id: ObjectId;
}

export type CodeDto = WithId<MosCode>;
export type TextDto = WithId<MosText>;
export type DateDto = WithId<MosDate>;
export type DateTimeDto = WithId<MosDateTime>;
export type MeasureDto = WithId<MosMeasure>;
export type IdentifierDto = WithId<MosIdentifier>;
export type MetadataDto = WithId<MosMetadata>;
export type LangueParleeDto = WithId<MosLangueParlee>;
export type AdresseDto = WithId<MosAdresse>;
export type IndicatorDto = WithId<MosIndicator>;
export type NumericDto = WithId<MosNumeric>;
export type CapacityDto = WithId<MosCapacity>;
export type TelecommunicationDto = WithId<MosTelecommunication>;
export type BoiteLettreMSSDto = WithId<MosBoiteLettreMSS>;
export type DiplomeDto = WithId<MosDiplome>;
export type HoraireDto = WithId<MosHoraire>;

export const CodeSerializer = {
  toDocument(input: MosCode): MosCode {
    return sanitizeCode(input);
  },
  fromDocument(document: CodeDocument): CodeDto {
    return toDto(document, sanitizeCode);
  },
  sanitize: sanitizeCode,
};

export const TextSerializer = {
  toDocument(input: MosText): MosText {
    return sanitizeText(input);
  },
  fromDocument(document: TextDocument): TextDto {
    return toDto(document, sanitizeText);
  },
  sanitize: sanitizeText,
};

export const DateSerializer = {
  toDocument(input: MosDate): MosDate {
    return sanitizeDate(input);
  },
  fromDocument(document: DateDocument): DateDto {
    return toDto(document, sanitizeDate);
  },
  sanitize: sanitizeDate,
};

export const DateTimeSerializer = {
  toDocument(input: MosDateTime): MosDateTime {
    return sanitizeDateTime(input);
  },
  fromDocument(document: DateTimeDocument): DateTimeDto {
    return toDto(document, sanitizeDateTime);
  },
  sanitize: sanitizeDateTime,
};

export const MeasureSerializer = {
  toDocument(input: MosMeasure): MosMeasure {
    return sanitizeMeasure(input);
  },
  fromDocument(document: MeasureDocument): MeasureDto {
    return toDto(document, sanitizeMeasure);
  },
  sanitize: sanitizeMeasure,
};

export const IdentifierSerializer = {
  toDocument(input: MosIdentifier): MosIdentifier {
    return sanitizeIdentifier(input);
  },
  fromDocument(document: IdentifierDocument): IdentifierDto {
    return toDto(document, sanitizeIdentifier);
  },
  sanitize: sanitizeIdentifier,
};

export const MetadataSerializer = {
  toDocument(input: MosMetadata): MosMetadata {
    return sanitizeMetadata(input);
  },
  fromDocument(document: MetadataDocument): MetadataDto {
    return toDto(document, sanitizeMetadata);
  },
  sanitize: sanitizeMetadata,
};

export const LangueParleeSerializer = {
  toDocument(input: MosLangueParlee): MosLangueParlee {
    return sanitizeLangueParlee(input);
  },
  fromDocument(document: LangueParleeDocument): LangueParleeDto {
    return toDto(document, sanitizeLangueParlee);
  },
  sanitize: sanitizeLangueParlee,
};

export const AdresseSerializer = {
  toDocument(input: MosAdresse): MosAdresse {
    return sanitizeAdresse(input);
  },
  fromDocument(document: AdresseDocument): AdresseDto {
    return toDto(document, sanitizeAdresse);
  },
  sanitize: sanitizeAdresse,
};

export const IndicatorSerializer = {
  toDocument(input: MosIndicator): MosIndicator {
    return sanitizeIndicator(input);
  },
  fromDocument(document: IndicatorDocument): IndicatorDto {
    return toDto(document, sanitizeIndicator);
  },
  sanitize: sanitizeIndicator,
};

export const NumericSerializer = {
  toDocument(input: MosNumeric): MosNumeric {
    return sanitizeNumeric(input);
  },
  fromDocument(document: NumericDocument): NumericDto {
    return toDto(document, sanitizeNumeric);
  },
  sanitize: sanitizeNumeric,
};

export const CapacitySerializer = {
  toDocument(input: MosCapacity): MosCapacity {
    return sanitizeCapacity(input);
  },
  fromDocument(document: CapacityDocument): CapacityDto {
    return toDto(document, sanitizeCapacity);
  },
  sanitize: sanitizeCapacity,
};

export const TelecommunicationSerializer = {
  toDocument(input: MosTelecommunication): MosTelecommunication {
    return sanitizeTelecommunication(input);
  },
  fromDocument(document: TelecommunicationDocument): TelecommunicationDto {
    return toDto(document, sanitizeTelecommunication);
  },
  sanitize: sanitizeTelecommunication,
};

export const BoiteLettreMSSSerializer = {
  toDocument(input: MosBoiteLettreMSS): MosBoiteLettreMSS {
    return sanitizeBoiteLettreMSS(input);
  },
  fromDocument(document: BoiteLettreMSSDocument): BoiteLettreMSSDto {
    return toDto(document, sanitizeBoiteLettreMSS);
  },
  sanitize: sanitizeBoiteLettreMSS,
};

export const DiplomeSerializer = {
  toDocument(input: MosDiplome): MosDiplome {
    return sanitizeDiplome(input);
  },
  fromDocument(document: DiplomeDocument): DiplomeDto {
    return toDto(document, sanitizeDiplome);
  },
  sanitize: sanitizeDiplome,
};

export const HoraireSerializer = {
  toDocument(input: MosHoraire): MosHoraire {
    return sanitizeHoraire(input);
  },
  fromDocument(document: HoraireDocument): HoraireDto {
    return toDto(document, sanitizeHoraire);
  },
  sanitize: sanitizeHoraire,
};
