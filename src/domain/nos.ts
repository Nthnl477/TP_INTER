import { MosCode } from "./types";

interface NosEntry {
  code: string;
  libelle: string;
  nomenclature: string;
  version?: string;
}

type NosCatalog = Record<string, Record<string, NosEntry>>;

export const NOS_CATALOG: NosCatalog = {
  civilite: {
    M: {
      code: "M",
      libelle: "Monsieur",
      nomenclature: "TRE_R03-Civilite",
      version: "2024-01",
    },
    F: {
      code: "F",
      libelle: "Madame",
      nomenclature: "TRE_R03-Civilite",
      version: "2024-01",
    },
  },
  sexe: {
    M: {
      code: "M",
      libelle: "Masculin",
      nomenclature: "TRE_R02-Sexe",
      version: "2024-01",
    },
    F: {
      code: "F",
      libelle: "Féminin",
      nomenclature: "TRE_R02-Sexe",
      version: "2024-01",
    },
  },
  typeCarte: {
    CPS: {
      code: "CPS",
      libelle: "Carte de professionnel de santé",
      nomenclature: "TRE_G10-TypeCarteCPS",
      version: "2024-01",
    },
  },
  usageCertificat: {
    AUTH: {
      code: "AUTH",
      libelle: "Usage authentification",
      nomenclature: "TRE_G13-UsageCertificat",
      version: "2024-01",
    },
    SIGN: {
      code: "SIGN",
      libelle: "Usage signature",
      nomenclature: "TRE_G13-UsageCertificat",
      version: "2024-01",
    },
  },
  domaineCertificat: {
    Sante: {
      code: "SANTE",
      libelle: "Domaine santé numérique",
      nomenclature: "TRE_G14-DomaineCertificat",
      version: "2024-01",
    },
  },
  usageProfessionnel: {
    PRESC: {
      code: "PRESC",
      libelle: "Prescription",
      nomenclature: "TRE_G11-UsageProfessionnel",
      version: "2024-01",
    },
  },
  statutPublication: {
    PUB: {
      code: "PUB",
      libelle: "Publié",
      nomenclature: "TRE_G15-StatutPublication",
      version: "2024-01",
    },
  },
  discipline: {
    MED_GEN: {
      code: "MED-GEN",
      libelle: "Médecine générale",
      nomenclature: "TRE_R84-Discipline",
      version: "2024-01",
    },
  },
  roleProfessionnel: {
    MEDECIN: {
      code: "MEDECIN",
      libelle: "Médecin",
      nomenclature: "TRE_R01-ProfessionSante",
      version: "2024-01",
    },
  },
  modeExercice: {
    LIBERAL: {
      code: "LIB",
      libelle: "Exercice libéral",
      nomenclature: "TRE_R33-ModeExercice",
      version: "2024-01",
    },
  },
  habilitation: {
    AIDE_SOCIALE: {
      code: "AIDE_SOCIALE",
      libelle: "Habilitation aide sociale",
      nomenclature: "TRE_R90-Habilitation",
      version: "2024-01",
    },
  },
  modeFinancement: {
    CPAM: {
      code: "CPAM",
      libelle: "Financement assurance maladie",
      nomenclature: "TRE_R91-ModeFinancement",
      version: "2024-01",
    },
  },
};

export function nosCode(domain: keyof typeof NOS_CATALOG, key: string): MosCode {
  const domainCatalog = NOS_CATALOG[domain];
  if (!domainCatalog) {
    throw new Error(`NOS domain '${domain}' inconnu`);
  }
  const entry = domainCatalog[key];
  if (!entry) {
    throw new Error(`Code '${key}' absent du domaine NOS '${domain}'`);
  }
  return {
    valeur: entry.code,
    libelle: entry.libelle,
    identifiantNomenclature: entry.nomenclature,
    nomNomenclature: entry.nomenclature,
    versionNomenclature: entry.version,
    urnNomenclature: `urn:mos:nos:${entry.nomenclature}`,
  } satisfies MosCode;
}
