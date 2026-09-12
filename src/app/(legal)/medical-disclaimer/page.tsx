import Link from "next/link";

export default function MedicalDisclaimerPage() {
  return (
    <article className="legal-article">
      <h1>Medical disclaimer</h1>
      <p>
        <strong>Magna-Q is an educational preparation service.</strong> Its
        question banks, explanations, articles, videos, community discussions,
        interview tools, and AI-assisted feedback are for educational and
        informational purposes only.
      </p>
      <p>
        Magna-Q does not provide medical advice, diagnosis, treatment,
        prescriptions, or patient-specific recommendations. The Service is not
        a healthcare provider, and using it does not create a clinician-patient
        relationship or replace medical school, clinical supervision, or
        consultation with a qualified healthcare professional.
      </p>
      <p>
        Educational content may be incomplete, may become outdated, and may not
        reflect the laws, professional standards, local protocols, or clinical
        circumstances that apply to a particular patient or location. Do not use
        Magna-Q as the sole basis for patient care. Always verify clinical
        information against current authoritative guidance and apply licensed
        supervision and your independent professional judgment.
      </p>
      <p>
        Do not delay seeking professional care because of anything on this
        platform. In a medical emergency, contact the appropriate local
        emergency service immediately. Magna-Q does not guarantee examination
        results, certification, licensure, interviews, visa sponsorship,
        residency placement, or Match outcomes.
      </p>
      <p>
        <Link href="/terms#education-only">
          Read the full educational and professional-responsibility terms
        </Link>
        .
      </p>
    </article>
  );
}
