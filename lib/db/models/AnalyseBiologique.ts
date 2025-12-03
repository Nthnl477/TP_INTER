import mongoose, { Schema, type Document, type Types } from "mongoose"

export type AnalyseStatut = "PRESCRIT" | "EN_COURS" | "VALIDE"

export interface IExamen {
  codeTest: string
  libelle: string
  valeur?: string
  unite?: string
  intervalleReference?: string
  interpretation?: string
}

export interface IAnalyseBiologique extends Document {
  patient: Types.ObjectId
  prescripteur: Types.ObjectId
  laboratoire: Types.ObjectId
  datePrescription: Date
  dateResultat?: Date
  statut: AnalyseStatut
  examens: IExamen[]
  createdAt: Date
  updatedAt: Date
}

const ExamenSchema = new Schema<IExamen>({
  codeTest: { type: String, required: true },
  libelle: { type: String, required: true },
  valeur: String,
  unite: String,
  intervalleReference: String,
  interpretation: String,
})

const AnalyseBiologiqueSchema = new Schema<IAnalyseBiologique>(
  {
    patient: { type: Schema.Types.ObjectId, ref: "Patient", required: true },
    prescripteur: { type: Schema.Types.ObjectId, ref: "ProfessionnelDeSante", required: true },
    laboratoire: { type: Schema.Types.ObjectId, ref: "Etablissement", required: true },
    datePrescription: { type: Date, required: true },
    dateResultat: Date,
    statut: {
      type: String,
      enum: ["PRESCRIT", "EN_COURS", "VALIDE"],
      default: "PRESCRIT",
    },
    examens: [ExamenSchema],
  },
  { timestamps: true },
)

export const AnalyseBiologique =
  mongoose.models.AnalyseBiologique || mongoose.model<IAnalyseBiologique>("AnalyseBiologique", AnalyseBiologiqueSchema)
