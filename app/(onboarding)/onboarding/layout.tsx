import Link from "next/link";
import Image from "next/image";
import { StepProgress } from "@/components/onboarding/step-progress";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-primary-50/60 px-4 py-12">
      <div className="mx-auto max-w-xl">
        <Link
          href="/"
          className="mb-8 flex items-center justify-center gap-2 font-semibold text-primary-800"
        >
          <Image src="/farata-icon.png" alt="" width={40} height={40} className="h-9 w-9" priority />
          <span className="text-xl tracking-tight">FarataNikah</span>
        </Link>

        <StepProgress />

        <div className="rounded-2xl border border-primary-100 bg-cream-50 p-8 shadow-sm">
          {children}
        </div>
      </div>
    </div>
  );
}
