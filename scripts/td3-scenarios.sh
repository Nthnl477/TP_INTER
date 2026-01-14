#!/usr/bin/env bash

# TD3 scenario runner: simulate doctor → platform → lab → platform (FHIR)
# Requirements: curl, jq, a valid Bearer token in $TOKEN, and reachable FHIR endpoints.

set -euo pipefail

if [ -z "${TOKEN:-}" ]; then
  echo "Set TOKEN environment variable to a valid Bearer token" >&2
  exit 1
fi

BASE="${BASE:-http://localhost:3000}"

echo "Using BASE=$BASE"

doctor_send_prescription() {
  echo "1) Doctor sends ServiceRequest (TSH/T3/T4) to platform..."
  curl -s -X POST "$BASE/api/fhir/servicerequests" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/fhir+json" \
    -d '{
      "resourceType": "ServiceRequest",
      "status": "active",
      "intent": "order",
      "code": { "coding": [{ "system": "http://loinc.org", "code": "24320-4", "display": "Lab orders" }]},
      "subject": { "reference": "Patient/'"$PATIENT_ID"'" },
      "performer": [{ "reference": "Organization/'"$LAB_ID"'" }],
      "authoredOn": "'"$(date -Iseconds)"'",
      "examens": [
        { "codeTest": "BIO-TSH", "libelle": "TSH" },
        { "codeTest": "BIO-T3L", "libelle": "T3 libre" },
        { "codeTest": "BIO-T4L", "libelle": "T4 libre" }
      ]
    }' | jq .
}

lab_send_results() {
  echo "2) Lab sends Observations + DiagnosticReport to platform..."
  curl -s -X POST "$BASE/api/fhir/observations" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/fhir+json" \
    -d '{
      "resourceType": "Observation",
      "status": "final",
      "code": { "coding": [{ "system": "http://loinc.org", "code": "3016-3", "display": "TSH" }]},
      "subject": { "reference": "Patient/'"$PATIENT_ID"'" },
      "valueQuantity": { "value": 0.9, "unit": "µUI/mL", "system": "http://unitsofmeasure.org", "code": "uIU/mL" }
    }' | jq .

  curl -s -X POST "$BASE/api/fhir/diagnosticreports" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/fhir+json" \
    -d '{
      "resourceType": "DiagnosticReport",
      "status": "final",
      "code": { "coding": [{ "system": "http://loinc.org", "code": "11502-2", "display": "Laboratory report" }]},
      "subject": { "reference": "Patient/'"$PATIENT_ID"'" },
      "conclusion": "Résultat TSH/T3/T4 normalisés (exemple TD3)."
    }' | jq .
}

doctor_send_cr() {
  echo "3) Doctor sends DocumentReference (CR) to platform..."
  curl -s -X POST "$BASE/api/fhir/documentreferences" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/fhir+json" \
    -d '{
      "resourceType": "DocumentReference",
      "status": "current",
      "type": {
        "coding": [{ "system": "http://loinc.org", "code": "11506-3", "display": "Consult note" }]
      },
      "subject": { "reference": "Patient/'"$PATIENT_ID"'" },
      "content": [{
        "attachment": {
          "contentType": "text/plain",
          "data": "'"$(echo -n "CR endocrinologue (suspicion de Basedow)" | base64)"'"
        }
      }]
    }' | jq .
}

if [ -z "${PATIENT_ID:-}" ] || [ -z "${LAB_ID:-}" ]; then
  echo "Set PATIENT_ID and LAB_ID env vars (Mongo IDs used in FHIR references)" >&2
  exit 1
fi

doctor_send_prescription
lab_send_results
doctor_send_cr
