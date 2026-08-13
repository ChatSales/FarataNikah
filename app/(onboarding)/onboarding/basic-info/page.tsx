import type { Metadata } from "next";
import { BasicInfoForm } from "@/components/onboarding/basic-info-form";

export const metadata: Metadata = { title: "Tes informations" };

export default function BasicInfoPage() {
  return (
    <>
      <h1 className="text-center text-xl font-semibold text-primary-900">
        Parle-nous de toi
      </h1>
      <p className="mt-1.5 text-center text-sm text-primary-900/60">
        Ces informations apparaîtront sur ton profil.
      </p>
      <div className="mt-8">
        <BasicInfoForm />
      </div>
    </>
  );
}
