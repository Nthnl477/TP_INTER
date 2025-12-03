import mongoose, { Schema, type Document, type Types } from "mongoose"

export interface IPatient extends Document {
  utilisateur: Types.ObjectId
  identifiantPatientLocal: string
  ins?: string
  nom: string
  prenom: string
  dateNaissance: Date
  sexe: string
  coordonnees: {
    telephone?: string
    email?: string
    adresse?: string
  }
  professionnelsDuCercleDeSoin: Types.ObjectId[]
  createdAt: Date
  updatedAt: Date
}

const PatientSchema = new Schema<IPatient>(
  {
    utilisateur: { type: Schema.Types.ObjectId, ref: "User", required: true },
    identifiantPatientLocal: { type: String, required: true, unique: true },
    ins: String,
    nom: { type: String, required: true },
    prenom: { type: String, required: true },
    dateNaissance: { type: Date, required: true },
    sexe: { type: String, required: true },
    coordonnees: {
      telephone: String,
      email: String,
      adresse: String,
    },
    professionnelsDuCercleDeSoin: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true },
)

export const Patient = mongoose.models.Patient || mongoose.model<IPatient>("Patient", PatientSchema)
