import { ObjectId } from "mongodb";
import {
  CodeSerializer,
  DateSerializer,
  IdentifierSerializer,
  LangueParleeSerializer,
  MeasureSerializer,
  MetadataSerializer,
  TextSerializer,
} from "./serialization";
import {
  MosCode,
  MosDate,
  MosIdentifier,
  MosLangueParlee,
  MosMeasure,
  MosMetadata,
  MosText,
} from "./types";
import { stripUndefined } from "./utils";

export interface PersonnePhysique {
  identifiants?: MosIdentifier[];
  civilite?: MosCode;
  nomNaissance: string;
  nomUsage?: string;
  prenoms: string[];
  dateNaissance?: MosDate;
  lieuNaissance?: MosText;
  sexe?: MosCode;
  nationalites?: MosCode[];
  languesParlees?: MosLangueParlee[];
  mesures?: MosMeasure[];
  metadonnee?: MosMetadata;
}

export interface PersonnePhysiqueDocument extends PersonnePhysique {
  _id: ObjectId;
}

export interface PersonnePhysiqueDto extends PersonnePhysique {
  id: string;
}

export const PERSONNE_PHYSIQUE_COLLECTION = "personnesPhysiques";

const sanitizePersonnePhysique = (value: PersonnePhysique): PersonnePhysique =>
  stripUndefined({
    ...value,
    identifiants: value.identifiants?.map(IdentifierSerializer.toDocument),
    civilite: value.civilite ? CodeSerializer.toDocument(value.civilite) : undefined,
    prenoms: [...value.prenoms],
    dateNaissance: value.dateNaissance ? DateSerializer.toDocument(value.dateNaissance) : undefined,
    lieuNaissance: value.lieuNaissance ? TextSerializer.toDocument(value.lieuNaissance) : undefined,
    sexe: value.sexe ? CodeSerializer.toDocument(value.sexe) : undefined,
    nationalites: value.nationalites?.map(CodeSerializer.toDocument),
    languesParlees: value.languesParlees?.map(LangueParleeSerializer.toDocument),
    mesures: value.mesures?.map(MeasureSerializer.toDocument),
    metadonnee: value.metadonnee ? MetadataSerializer.toDocument(value.metadonnee) : undefined,
  });

export const PersonnePhysiqueSerializer = {
  toDocument(input: PersonnePhysique): PersonnePhysique {
    return sanitizePersonnePhysique(input);
  },
  fromDocument(document: PersonnePhysiqueDocument): PersonnePhysiqueDto {
    const { _id, ...rest } = document;
    const base = sanitizePersonnePhysique(rest);
    return {
      id: _id.toHexString(),
      ...base,
    };
  },
  sanitize: sanitizePersonnePhysique,
};
