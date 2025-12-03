# Guide d'extension - Epitanie

## Ajouter une nouvelle entité

### Exemple : Ajouter "Prescription"

#### 1. Créer le model MongoDB

Créer `lib/db/models/Prescription.ts` :

\`\`\`typescript
import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IPrescription extends Document {
  patient: Types.ObjectId;
  prescripteur: Types.ObjectId;
  medicament: string;
  dosage: string;
  duree: number;
  dateDebut: Date;
  statut: 'ACTIVE' | 'TERMINEE' | 'SUSPENDUE';
  createdAt: Date;
  updatedAt: Date;
}

const PrescriptionSchema = new Schema<IPrescription>(
  {
    patient: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
    prescripteur: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    medicament: { type: String, required: true },
    dosage: { type: String, required: true },
    duree: { type: Number, required: true },
    dateDebut: { type: Date, required: true },
    statut: {
      type: String,
      enum: ['ACTIVE', 'TERMINEE', 'SUSPENDUE'],
      default: 'ACTIVE',
    },
  },
  { timestamps: true }
);

export const Prescription =
  mongoose.models.Prescription ||
  mongoose.model<IPrescription>('Prescription', PrescriptionSchema);
\`\`\`

#### 2. Créer l'API endpoint

Créer `app/api/prescriptions/route.ts` :

\`\`\`typescript
import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/keycloak/auth-context';
import connectToDatabase from '@/lib/db/connection';
import { Prescription } from '@/lib/db/models/Prescription';
import { handleApiError, successResponse } from '@/lib/api/error-handler';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth();
    await connectToDatabase();

    // TODO: Add authorization checks
    const prescriptions = await Prescription.find()
      .populate('patient')
      .populate('prescripteur');

    return successResponse(prescriptions);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth();
    await connectToDatabase();

    // TODO: Add authorization checks
    const body = await request.json();
    const prescription = new Prescription(body);
    await prescription.save();

    return successResponse(prescription, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
\`\`\`

#### 3. Créer les composants UI

Créer `components/professional/prescriptions-list.tsx` :

\`\`\`typescript
'use client';

import { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export function PrescriptionsList() {
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await fetch('/api/prescriptions');
        const data = await res.json();
        setPrescriptions(data.data || []);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, []);

  if (loading) return <div>Chargement...</div>;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Patient</TableHead>
          <TableHead>Médicament</TableHead>
          <TableHead>Dosage</TableHead>
          <TableHead>Statut</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {prescriptions.map((p) => (
          <TableRow key={p._id}>
            <TableCell>{p.patient?.prenom} {p.patient?.nom}</TableCell>
            <TableCell>{p.medicament}</TableCell>
            <TableCell>{p.dosage}</TableCell>
            <TableCell>
              <Badge>{p.statut}</Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
\`\`\`

## Ajouter l'intégration FHIR

### 1. Installer le package FHIR

\`\`\`bash
npm install fhir
\`\`\`

### 2. Créer un adapter FHIR

Créer `lib/fhir/adapter.ts` :

\`\`\`typescript
import { Patient as FHIRPatient } from 'fhir/r4';
import { IPatient } from '@/lib/db/models/Patient';

export function patientToFHIR(patient: IPatient): FHIRPatient {
  return {
    resourceType: 'Patient',
    id: patient._id.toString(),
    name: [{
      use: 'official',
      family: patient.nom,
      given: [patient.prenom],
    }],
    birthDate: patient.dateNaissance.toISOString().split('T')[0],
    gender: patient.sexe.toLowerCase() === 'homme' ? 'male' : 'female',
    contact: patient.coordonnees ? [{
      telecom: [
        { system: 'phone', value: patient.coordonnees.telephone },
        { system: 'email', value: patient.coordonnees.email },
      ],
    }] : undefined,
  };
}
\`\`\`

### 3. Créer un endpoint FHIR

Créer `app/api/fhir/Patient/[id]/route.ts` :

\`\`\`typescript
import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/connection';
import { Patient } from '@/lib/db/models/Patient';
import { patientToFHIR } from '@/lib/fhir/adapter';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectToDatabase();

    const patient = await Patient.findById(id);
    if (!patient) {
      return NextResponse.json({ resourceType: 'OperationOutcome', issue: [] }, { status: 404 });
    }

    return NextResponse.json(patientToFHIR(patient), {
      headers: { 'Content-Type': 'application/fhir+json' },
    });
  } catch (error) {
    return NextResponse.json({ resourceType: 'OperationOutcome', issue: [] }, { status: 500 });
  }
}
\`\`\`

## Ajouter le stockage de fichiers

### Utiliser Vercel Blob

\`\`\`bash
npm install @vercel/blob
\`\`\`

Créer `app/api/documents/upload/route.ts` :

\`\`\`typescript
import { put } from '@vercel/blob';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  const file = await request.file();
  if (!file) return new Response('No file', { status: 400 });

  const blob = await put(file.name, file.stream(), {
    access: 'token',
  });

  return Response.json(blob);
}
\`\`\`

## Ajouter les notifications email

### Utiliser Resend ou SendGrid

Exemple avec Resend :

\`\`\`bash
npm install resend
\`\`\`

Créer `lib/email/notifications.ts` :

\`\`\`typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendAppointmentNotification(email: string, appointmentDetails: any) {
  await resend.emails.send({
    from: 'epitanie@example.com',
    to: email,
    subject: 'Confirmation de rendez-vous',
    html: `<p>Votre rendez-vous a été confirmé pour ${appointmentDetails.date}</p>`,
  });
}
\`\`\`

## Ajouter les tests

### Utiliser Jest + Supertest

\`\`\`bash
npm install --save-dev jest @types/jest supertest
\`\`\`

Créer `app/api/patients/__tests__/route.test.ts` :

\`\`\`typescript
import { GET } from '../route';

describe('GET /api/patients', () => {
  it('should return patients', async () => {
    const response = await GET();
    expect(response.status).toBe(200);
  });
});
\`\`\`

## Roadmap recommandée

1. **Phase 1** (actuellement) : Core platform
2. **Phase 2** : FHIR integration
3. **Phase 3** : Storage & notifications
4. **Phase 4** : Advanced features (signatures, calendrier, real-time)
