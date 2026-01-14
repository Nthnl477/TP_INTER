import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/keycloak/auth-context"
import connectToDatabase from "@/lib/db/connection"
import { Patient } from "@/lib/db/models/Patient"
import { ProfessionnelDeSante } from "@/lib/db/models/ProfessionnelDeSante"
import { Etablissement } from "@/lib/db/models/Etablissement"
import { FhirResource } from "@/lib/db/models/FhirResource"
import { isAdmin, isHealthcareProfessional, getMongoUserIdFromKeycloak } from "@/lib/api/authorization"
import { handleApiError, successResponse, BadRequestException } from "@/lib/api/error-handler"

// POC: expose a synthetic echography imaging flow (ServiceRequest + DiagnosticReport + ImagingStudy)
export async function GET(_request: NextRequest) {
  try {
    const auth = await requireAuth()
    if (!isAdmin(auth) && !isHealthcareProfessional(auth)) {
      throw new Error("Unauthorized")
    }

    await connectToDatabase()

    const mongoUserId = await getMongoUserIdFromKeycloak(auth.userId)

    const patient = await Patient.findOne().sort({ createdAt: 1 })
    const professional =
      (mongoUserId &&
        (await ProfessionnelDeSante.findOne({ utilisateur: mongoUserId }).populate("utilisateur"))) ||
      (await ProfessionnelDeSante.findOne().sort({ createdAt: 1 }).populate("utilisateur"))
    const hospital = await Etablissement.findOne({ typeEtablissement: "HOPITAL" }).sort({ createdAt: 1 })

    if (!patient || !professional || !hospital) {
      throw new Error("Missing data to build imaging flow (patient/pro/hospital)")
    }

    const srId = `sr-echo-${patient._id}`
    const drId = `dr-echo-${patient._id}`
    const imgId = `img-echo-${patient._id}`

    const patientRef = { reference: `Patient/${patient._id}`, display: `${patient.prenom} ${patient.nom}` }
    const practitionerDisplay = `${professional.utilisateur?.prenom ?? ""} ${professional.utilisateur?.nom ?? ""}`.trim()
    const practitionerRef = { reference: `Practitioner/${professional._id}`, display: practitionerDisplay || undefined }
    const orgRef = { reference: `Organization/${hospital._id}`, display: hospital.nom }

    const orgIdentifier =
      hospital.codeNOS != null
        ? [
            {
              system: "https://ans.gouv.fr/nos",
              value: hospital.codeNOS,
            },
          ]
        : undefined

    const imagingSeries = [
      {
        uid: "1.2.3.4.5.6.7.8.1",
        number: 1,
        modality: { system: "http://dicom.nema.org/resources/ontology/DCM", code: "US", display: "Ultrasound" },
        description: "Thyroid ultrasound series",
        numberOfInstances: 2,
        instance: [
          {
            uid: "1.2.3.4.5.6.7.8.1.1",
            sopClass: { system: "urn:ietf:rfc:3986", code: "1.2.840.10008.5.1.4.1.1.6.1", display: "Ultrasound Image" },
          },
          {
            uid: "1.2.3.4.5.6.7.8.1.2",
            sopClass: { system: "urn:ietf:rfc:3986", code: "1.2.840.10008.5.1.4.1.1.6.1", display: "Ultrasound Image" },
          },
        ],
      },
    ]

    const serviceRequest = {
      resourceType: "ServiceRequest",
      id: srId,
      status: "active",
      intent: "order",
      code: {
        coding: [
          {
            system: "http://loinc.org",
            code: "45064-8",
            display: "US Thyroid",
          },
        ],
        text: "Echographie thyroïdienne",
      },
      subject: patientRef,
      requester: practitionerRef,
      performer: [orgRef],
      authoredOn: new Date().toISOString(),
    }

    const imagingStudy = {
      resourceType: "ImagingStudy",
      id: imgId,
      status: "available",
      modality: [
        {
          system: "http://dicom.nema.org/resources/ontology/DCM",
          code: "US",
          display: "Ultrasound",
        },
      ],
      subject: patientRef,
      referrer: practitionerRef,
      started: new Date().toISOString(),
      basedOn: [{ reference: `ServiceRequest/${srId}` }],
      numberOfSeries: imagingSeries.length,
      numberOfInstances: imagingSeries.reduce((acc, s) => acc + (s.numberOfInstances || 0), 0),
      series: imagingSeries,
    }

    const diagnosticReport = {
      resourceType: "DiagnosticReport",
      id: drId,
      status: "final",
      code: {
        coding: [
          {
            system: "http://loinc.org",
            code: "45064-8",
            display: "US Thyroid",
          },
        ],
        text: "CR Echographie thyroïdienne",
      },
      subject: patientRef,
      performer: [orgRef],
      issued: new Date().toISOString(),
      basedOn: [{ reference: `ServiceRequest/${srId}` }],
      imagingStudy: [{ reference: `ImagingStudy/${imgId}` }],
      conclusion: "Nodule thyroïdien benign (exemple démonstration)",
    }

    const documentReference = {
      resourceType: "DocumentReference",
      id: `docref-${patient._id}`,
      status: "current",
      type: {
        coding: [
          {
            system: "http://loinc.org",
            code: "45064-8",
            display: "US Thyroid",
          },
        ],
        text: "Compte-rendu d'échographie",
      },
      subject: patientRef,
      author: [practitionerRef],
      custodian: orgRef,
      date: new Date().toISOString(),
      content: [
        {
          attachment: {
            contentType: "text/plain",
            data: Buffer.from("Compte-rendu échographie thyroïdienne (exemple)").toString("base64"),
          },
        },
      ],
      context: {
        encounter: [{ reference: `ServiceRequest/${srId}` }],
        related: [{ reference: `ImagingStudy/${imgId}` }],
      },
    }

    const entries = [
      { resource: serviceRequest },
      { resource: imagingStudy },
      { resource: diagnosticReport },
      { resource: documentReference },
      // Minimal FHIR Patient/Practitioner/Organization context
      {
        resource: {
          resourceType: "Patient",
          id: patient._id.toString(),
          name: [{ family: patient.nom, given: [patient.prenom] }],
        },
      },
      {
        resource: {
          resourceType: "Practitioner",
          id: professional._id.toString(),
          name: [
            {
              family: professional.utilisateur?.nom,
              given: [professional.utilisateur?.prenom].filter(Boolean),
            },
          ],
        },
      },
      {
        resource: {
          resourceType: "Organization",
          id: hospital._id.toString(),
          identifier: orgIdentifier,
          name: hospital.nom,
        },
      },
    ]

    const storedImaging = await FhirResource.find({ resourceType: { $in: ["ImagingStudy", "DocumentReference"] } }).lean()
    const storedEntries = storedImaging.map((s) => ({ resource: { ...s.resource, id: s._id.toString() } }))

    return successResponse({
      resourceType: "Bundle",
      type: "collection",
      total: entries.length + storedEntries.length,
      entry: [...entries, ...storedEntries],
    })
  } catch (error) {
    return handleApiError(error)
  }
}

// POST ImagingStudy or DocumentReference
export async function POST(request: NextRequest) {
  try {
    await requireAuth()
    await connectToDatabase()
    const body = await request.json()
    if (body.resourceType !== "ImagingStudy" && body.resourceType !== "DocumentReference") {
      throw new BadRequestException("resourceType must be ImagingStudy or DocumentReference")
    }
    const created = await FhirResource.create({ resourceType: body.resourceType, resource: body })
    return successResponse({ ...body, id: created._id.toString() }, 201)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireAuth()
    await connectToDatabase()
    const body = await request.json()
    if (!body.id || (body.resourceType !== "ImagingStudy" && body.resourceType !== "DocumentReference")) {
      throw new BadRequestException("resourceType ImagingStudy/DocumentReference with id required")
    }
    const updated = await FhirResource.findOneAndUpdate(
      { _id: body.id, resourceType: body.resourceType },
      { resource: body },
      { upsert: true, new: true },
    )
    return successResponse({ ...body, id: updated._id.toString() })
  } catch (error) {
    return handleApiError(error)
  }
}
