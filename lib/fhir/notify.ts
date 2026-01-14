import { FhirSubscription } from "@/lib/db/models/FhirSubscription"

export async function notifySubscribers(resourceType: string, resource: any) {
  try {
    const subs = await FhirSubscription.find({ status: "active" })
    for (const sub of subs) {
      if (!sub.criteria || !sub.criteria.toLowerCase().includes(resourceType.toLowerCase())) continue
      const endpoint = sub.channel?.endpoint
      if (!endpoint) continue
      // Best-effort webhook
      fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": sub.channel.payload || "application/fhir+json" },
        body: JSON.stringify(resource),
      }).catch((err) => console.error("Subscription notify failed", err))
    }
  } catch (error) {
    console.error("Error notifying subscribers", error)
  }
}
