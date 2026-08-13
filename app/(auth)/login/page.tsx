import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = { title: "Connexion" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const { redirect } = await searchParams;

  return (
    <>
      <h1 className="text-center text-xl font-semibold text-primary-900">
        Content de te revoir
      </h1>
      <p className="mt-1.5 text-center text-sm text-primary-900/60">
        Connecte-toi à ton compte FarataNikah.
      </p>
      <div className="mt-8">
        <LoginForm redirectTo={redirect || "/app/home"} />
      </div>
    </>
  );
}
