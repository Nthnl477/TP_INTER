import mongoose, { Schema, type Document } from "mongoose"

export type TypeEtablissement = "HOPITAL" | "CABINET_LIBERAL" | "LABORATOIRE"

export interface IEtablissement extends Document {
  nom: string
  typeEtablissement: TypeEtablissement
  codeNOS?: string
  adresseSimplifiee?: string
  createdAt: Date
  updatedAt: Date
}

const EtablissementSchema = new Schema<IEtablissement>(
  {
    nom: { type: String, required: true },
    typeEtablissement: {
      type: String,
      enum: ["HOPITAL", "CABINET_LIBERAL", "LABORATOIRE"],
      required: true,
    },
    codeNOS: String,
    adresseSimplifiee: String,
  },
  { timestamps: true },
)

export const Etablissement =
  mongoose.models.Etablissement || mongoose.model<IEtablissement>("Etablissement", EtablissementSchema)
