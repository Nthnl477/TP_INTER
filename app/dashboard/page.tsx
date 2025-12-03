import { redirect } from "next/navigation"
import { getAuthContext } from "@/lib/keycloak/auth-context"

export default async function DashboardPage() {
  const auth = await getAuthContext()

  if (!auth) {
    redirect("/login")
  }

  // Redirect to role-specific dashboard
  if (auth.roles.includes("ROLE_ADMIN")) {
    redirect("/dashboard/admin")
  }

  if (auth.roles.includes("ROLE_SECRETARIAT")) {
    redirect("/dashboard/secretariat")
  }

  if (auth.roles.includes("ROLE_MEDECIN") || auth.roles.includes("ROLE_INFIRMIER")) {
    redirect("/dashboard/professionnel")
  }

  if (auth.roles.includes("ROLE_PATIENT")) {
    redirect("/dashboard/patient")
  }

  // Default fallback
  redirect("/dashboard/patient")
}
