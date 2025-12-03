import mongoose, { Schema, type Document } from "mongoose"

export type UserRole = "PATIENT" | "MEDECIN" | "INFIRMIER" | "SECRETARIAT" | "ADMIN"

export interface IMetaProfessionnelle {
  specialite?: string
  rpps?: string
}

export interface IMetaPatient {
  ins?: string
  dateNaissance?: Date
  sexe?: string
}

export interface IUser extends Document {
  keycloakId: string
  email: string
  nom: string
  prenom: string
  role: UserRole
  metaProfessionnelle?: IMetaProfessionnelle
  metaPatient?: IMetaPatient
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>(
  {
    keycloakId: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    nom: { type: String, required: true },
    prenom: { type: String, required: true },
    role: {
      type: String,
      enum: ["PATIENT", "MEDECIN", "INFIRMIER", "SECRETARIAT", "ADMIN"],
      required: true,
    },
    metaProfessionnelle: {
      specialite: String,
      rpps: String,
    },
    metaPatient: {
      ins: String,
      dateNaissance: Date,
      sexe: String,
    },
  },
  { timestamps: true },
)

export const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema)
