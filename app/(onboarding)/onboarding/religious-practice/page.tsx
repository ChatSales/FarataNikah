import type { Metadata } from "next";
import { ReligiousPracticeForm } from "@/components/onboarding/religious-practice-form";

export const metadata: Metadata = { title: "Ta pratique religieuse" };

export default function ReligiousPracticePage() {
  return (
    <>
      <h1 className="text-center text-xl font-semibold text-primary-900">
        Ta pratique et tes critères
      </h1>
      <p className="mt-1.5 text-center text-sm text-primary-900/60">
        Pour te proposer des profils réellement compatibles.
      </p>
      <div className="mt-8">
        <ReligiousPracticeForm />
      </div>
    </>
  );
}
