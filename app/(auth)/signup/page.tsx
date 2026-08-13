import type { Metadata } from "next";
import { SignupForm } from "@/components/auth/signup-form";

export const metadata: Metadata = { title: "Inscription" };

export default function SignupPage() {
  return (
    <>
      <h1 className="text-center text-xl font-semibold text-primary-900">
        Crée ton compte Farata
      </h1>
      <p className="mt-1.5 text-center text-sm text-primary-900/60">
        Gratuit, en 5 minutes.
      </p>
      <div className="mt-8">
        <SignupForm />
      </div>
    </>
  );
}
