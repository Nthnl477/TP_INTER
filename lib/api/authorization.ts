import type { UserAuthContext } from "@/lib/types/keycloak"
import { getUserByKeycloakId } from "@/lib/db/sync-user"
import { Patient } from "@/lib/db/models/Patient"
import { ProfessionnelDeSante } from "@/lib/db/models/ProfessionnelDeSante"

/**
 * Check if user has the required role
 */
export function hasRole(auth: UserAuthContext, ...roles: string[]): boolean {
  return roles.some((role) => auth.roles.includes(role))
}

/**
 * Check if user is admin
 */
export function isAdmin(auth: UserAuthContext): boolean {
  return hasRole(auth, "ROLE_ADMIN")
}

/**
 * Check if user is secretary
 */
export function isSecretary(auth: UserAuthContext): boolean {
  return hasRole(auth, "ROLE_SECRETARIAT")
}

/**
 * Check if user is healthcare professional (doctor or nurse)
 */
export function isHealthcareProfessional(auth: UserAuthContext): boolean {
  return hasRole(auth, "ROLE_MEDECIN", "ROLE_INFIRMIER")
}

/**
 * Check if user is a patient
 */
export function isPatient(auth: UserAuthContext): boolean {
  return hasRole(auth, "ROLE_PATIENT")
}

/**
 * Get MongoDB User ID from Keycloak ID
 */
export async function getMongoUserIdFromKeycloak(keycloakId: string): Promise<string | null> {
  try {
    const user = await getUserByKeycloakId(keycloakId)
    return user?._id.toString() || null
  } catch (error) {
    console.error("Error getting Mongo user ID:", error)
    return null
  }
}

/**
 * Check if professional is in patient's circle of care
 */
export async function isProfessionalInCircleOfCare(patientId: string, professionalUserId: string): Promise<boolean> {
  try {
    // Accept either a User ID or a ProfessionnelDeSante ID
    let resolvedUserId = professionalUserId
    const professionalDoc = await ProfessionnelDeSante.findById(professionalUserId)
    if (professionalDoc) {
      resolvedUserId = professionalDoc.utilisateur.toString()
    }

    const patient = await Patient.findById(patientId)
    if (!patient) return false

    return patient.professionnelsDuCercleDeSoin.some((id) => id.toString() === resolvedUserId)
  } catch (error) {
    console.error("Error checking circle of care:", error)
    return false
  }
}

/**
 * Check if user can access patient data
 * - Admin: can access all patients
 * - Secretary: can access all patients
 * - Healthcare professional: can only access patients in their circle of care
 * - Patient: can only access their own data
 */
export async function canAccessPatient(auth: UserAuthContext, patientId: string): Promise<boolean> {
  // Admin and Secretary can access all patients
  if (isAdmin(auth) || isSecretary(auth)) {
    return true
  }

  const mongoUserId = await getMongoUserIdFromKeycloak(auth.userId)
  if (!mongoUserId) return false

  // Patient can only access their own data
  if (isPatient(auth)) {
    const patient = await Patient.findById(patientId)
    return patient?.utilisateur.toString() === mongoUserId
  }

  // Healthcare professional can only access patients in their circle of care
  if (isHealthcareProfessional(auth)) {
    return await isProfessionalInCircleOfCare(patientId, mongoUserId)
  }

  return false
}
