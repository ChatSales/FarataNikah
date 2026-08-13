"use client";

import { usePathname } from "next/navigation";

const steps = [
  { path: "/onboarding/basic-info", label: "Infos" },
  { path: "/onboarding/religious-practice", label: "Pratique" },
  { path: "/onboarding/photos", label: "Photos" },
  { path: "/onboarding/privacy", label: "Confidentialité" },
];

export function StepProgress() {
  const pathname = usePathname();
  const currentIndex = steps.findIndex((s) => s.path === pathname);
  if (currentIndex === -1) return null;

  return (
    <ol className="mb-10 flex items-center justify-center gap-2 sm:gap-4">
      {steps.map((step, i) => (
        <li key={step.path} className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-2">
            <span
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                i <= currentIndex
                  ? "bg-primary-600 text-cream-50"
                  : "bg-primary-100 text-primary-500"
              }`}
            >
              {i + 1}
            </span>
            <span
              className={`hidden text-sm font-medium sm:inline ${
                i <= currentIndex ? "text-primary-900" : "text-primary-900/40"
              }`}
            >
              {step.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <span
              className={`h-px w-6 sm:w-10 ${
                i < currentIndex ? "bg-primary-500" : "bg-primary-100"
              }`}
            />
          )}
        </li>
      ))}
    </ol>
  );
}
