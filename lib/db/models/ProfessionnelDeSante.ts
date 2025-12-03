import mongoose, { Schema, type Document, type Types } from "mongoose"

export type ProfessionnelType = "MEDECIN" | "INFIRMIER"

export interface IProfessionnelDeSante extends Document {
  utilisateur: Types.ObjectId
  type: ProfessionnelType
  specialite: string
  rpps?: string
  etablissement: Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const ProfessionnelDeSanteSchema = new Schema<IProfessionnelDeSante>(
  {
    utilisateur: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["MEDECIN", "INFIRMIER"],
      required: true,
    },
    specialite: { type: String, required: true },
    rpps: String,
    etablissement: { type: Schema.Types.ObjectId, ref: "Etablissement", required: true },
  },
  { timestamps: true },
)

export const ProfessionnelDeSante =
  mongoose.models.ProfessionnelDeSante ||
  mongoose.model<IProfessionnelDeSante>("ProfessionnelDeSante", ProfessionnelDeSanteSchema)
