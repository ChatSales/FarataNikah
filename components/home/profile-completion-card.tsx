import Link from "next/link";
import Image from "next/image";
import { UserRound, MapPin } from "lucide-react";

export function ProfileCompletionCard({
  firstName,
  city,
  country,
  photoUrl,
  completionPercent,
}: {
  firstName: string;
  city: string;
  country: string;
  photoUrl: string | null;
  completionPercent: number;
}) {
  return (
    <Link
      href="/app/settings"
      className="mt-6 block rounded-2xl bg-gradient-to-br from-primary-700 to-primary-900 p-5 text-cream-50 transition hover:brightness-105"
    >
      <div className="flex items-center gap-3">
        <span className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-cream-50 text-primary-600">
          {photoUrl ? (
            <Image src={photoUrl} alt={firstName} fill sizes="56px" className="object-cover" />
          ) : (
            <UserRound className="h-7 w-7" />
          )}
        </span>
        <div className="min-w-0">
          <p className="truncate text-lg font-semibold">Salam, {firstName} !</p>
          <p className="flex items-center gap-1 text-xs text-cream-50/70">
            <MapPin className="h-3 w-3" /> {city}, {country}
          </p>
        </div>
      </div>

      <div className="mt-5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-cream-50/80">Profil complété</span>
          <span className="text-lg font-bold">{completionPercent}%</span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-cream-50/20">
          <div
            className="h-full rounded-full bg-cream-50 transition-all"
            style={{ width: `${completionPercent}%` }}
          />
        </div>
        <p className="mt-2 text-center text-xs text-cream-50/70">Cliquez pour compléter</p>
      </div>
    </Link>
  );
}
