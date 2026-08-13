import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata: Metadata = { title: "Nouveau mot de passe" };

export default function ResetPasswordPage() {
  return (
    <>
      <h1 className="text-center text-xl font-semibold text-primary-900">
        Choisis un nouveau mot de passe
      </h1>
      <div className="mt-8">
        <ResetPasswordForm />
      </div>
    </>
  );
}
