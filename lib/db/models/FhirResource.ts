import mongoose, { Schema, type Document } from "mongoose"

export interface IFhirResource extends Document {
  resourceType: string
  resource: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

const FhirResourceSchema = new Schema<IFhirResource>(
  {
    resourceType: { type: String, required: true },
    resource: { type: Schema.Types.Mixed, required: true },
  },
  { timestamps: true },
)

export const FhirResource =
  mongoose.models.FhirResource || mongoose.model<IFhirResource>("FhirResource", FhirResourceSchema)
