import mongoose, { Schema, type Document, type Types } from "mongoose"

export interface IDocumentClinique extends Document {
  patient: Types.ObjectId
  auteur: Types.ObjectId
  typeDocument: string
  titre: string
  contenuTexte: string
  urlFichier?: string
  codesNOSOuAutres: string[]
  createdAt: Date
  updatedAt: Date
}

const DocumentCliniqueSchema = new Schema<IDocumentClinique>(
  {
    patient: { type: Schema.Types.ObjectId, ref: "Patient", required: true },
    auteur: { type: Schema.Types.ObjectId, ref: "ProfessionnelDeSante", required: true },
    typeDocument: { type: String, required: true },
    titre: { type: String, required: true },
    contenuTexte: { type: String, required: true },
    urlFichier: String,
    codesNOSOuAutres: [String],
  },
  { timestamps: true },
)

export const DocumentClinique =
  mongoose.models.DocumentClinique || mongoose.model<IDocumentClinique>("DocumentClinique", DocumentCliniqueSchema)
