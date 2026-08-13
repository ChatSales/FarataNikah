import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata: Metadata = { title: "Mot de passe oublié" };

export default function ForgotPasswordPage() {
  return (
    <>
      <h1 className="text-center text-xl font-semibold text-primary-900">
        Mot de passe oublié
      </h1>
      <div className="mt-8">
        <ForgotPasswordForm />
      </div>
    </>
  );
}
