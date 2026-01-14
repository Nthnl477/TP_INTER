import mongoose, { Schema, type Document } from "mongoose"

export interface IFhirSubscription extends Document {
  status: string
  reason: string
  criteria: string
  channel: {
    type: string
    endpoint?: string
    payload?: string
  }
  createdAt: Date
  updatedAt: Date
}

const FhirSubscriptionSchema = new Schema<IFhirSubscription>(
  {
    status: { type: String, default: "active" },
    reason: String,
    criteria: String,
    channel: {
      type: {
        type: String,
        required: true,
      },
      endpoint: String,
      payload: String,
    },
  },
  { timestamps: true },
)

export const FhirSubscription =
  mongoose.models.FhirSubscription || mongoose.model<IFhirSubscription>("FhirSubscription", FhirSubscriptionSchema)
