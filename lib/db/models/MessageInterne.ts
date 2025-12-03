import mongoose, { Schema, type Document, type Types } from "mongoose"

export interface IMessageInterne extends Document {
  dossierPatient: Types.ObjectId
  auteur: Types.ObjectId
  destinataires: Types.ObjectId[]
  contenu: string
  dateEnvoi: Date
  luPar: Types.ObjectId[]
  createdAt: Date
  updatedAt: Date
}

const MessageInterneSchema = new Schema<IMessageInterne>(
  {
    dossierPatient: { type: Schema.Types.ObjectId, ref: "Patient", required: true },
    auteur: { type: Schema.Types.ObjectId, ref: "User", required: true },
    destinataires: [{ type: Schema.Types.ObjectId, ref: "User" }],
    contenu: { type: String, required: true },
    dateEnvoi: { type: Date, default: Date.now },
    luPar: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true },
)

export const MessageInterne =
  mongoose.models.MessageInterne || mongoose.model<IMessageInterne>("MessageInterne", MessageInterneSchema)
