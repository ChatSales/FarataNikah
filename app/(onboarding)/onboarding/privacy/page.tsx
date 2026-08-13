import type { Metadata } from "next";
import { PrivacyForm } from "@/components/onboarding/privacy-form";

export const metadata: Metadata = { title: "Confidentialité" };

export default function PrivacyStepPage() {
  return (
    <>
      <h1 className="text-center text-xl font-semibold text-primary-900">
        Ta vie privée, tes règles
      </h1>
      <p className="mt-1.5 text-center text-sm text-primary-900/60">
        Tu pourras modifier ces réglages à tout moment.
      </p>
      <div className="mt-8">
        <PrivacyForm />
      </div>
    </>
  );
}
