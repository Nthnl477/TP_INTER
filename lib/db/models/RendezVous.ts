import mongoose, { Schema, type Document, type Types } from "mongoose"

export type RendezVousStatut = "PLANIFIE" | "REALISE" | "ANNULE"

export interface IRendezVous extends Document {
  patient: Types.ObjectId
  professionnel: Types.ObjectId
  dateHeureDebut: Date
  dateHeureFin: Date
  type: string
  statut: RendezVousStatut
  creePar: Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const RendezVousSchema = new Schema<IRendezVous>(
  {
    patient: { type: Schema.Types.ObjectId, ref: "Patient", required: true },
    professionnel: { type: Schema.Types.ObjectId, ref: "ProfessionnelDeSante", required: true },
    dateHeureDebut: { type: Date, required: true },
    dateHeureFin: { type: Date, required: true },
    type: { type: String, required: true },
    statut: {
      type: String,
      enum: ["PLANIFIE", "REALISE", "ANNULE"],
      default: "PLANIFIE",
    },
    creePar: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
)

export const RendezVous = mongoose.models.RendezVous || mongoose.model<IRendezVous>("RendezVous", RendezVousSchema)
