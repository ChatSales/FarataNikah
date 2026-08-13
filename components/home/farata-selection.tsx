import Link from "next/link";
import Image from "next/image";
import { UserRound, Heart } from "lucide-react";
import { MiniFavoriteButton } from "@/components/home/mini-favorite-button";

export interface SelectionProfile {
  id: string;
  displayName: string;
  age: number;
  photoUrl: string | null;
  isFavorited: boolean;
}

export function FarataSelection({ profiles }: { profiles: SelectionProfile[] }) {
  if (profiles.length === 0) return null;

  return (
    <section className="mt-6 overflow-hidden rounded-2xl border border-primary-100 bg-cream-50 p-4">
      <div className="flex items-center gap-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-600">
          <Heart className="h-4 w-4" />
        </span>
        <div>
          <h2 className="text-sm font-semibold text-primary-900">La sélection Farata</h2>
          <p className="text-xs text-primary-900/55">Des profils choisis pour toi</p>
        </div>
      </div>

      <div className="-mx-4 mt-4 flex gap-3 overflow-x-auto px-4 pb-1">
        {profiles.map((p) => (
          <div
            key={p.id}
            className="relative w-32 shrink-0 overflow-hidden rounded-xl border border-primary-100"
          >
            <Link href={`/app/profile/${p.id}`}>
              <div className="relative aspect-[4/5] bg-primary-100">
                {p.photoUrl ? (
                  <Image
                    src={p.photoUrl}
                    alt={p.displayName}
                    fill
                    sizes="128px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-primary-400">
                    <UserRound className="h-8 w-8" />
                  </div>
                )}
              </div>
              <div className="bg-cream-50 px-2 py-1.5">
                <p className="truncate text-xs font-semibold text-primary-900">
                  {p.displayName}, {p.age}
                </p>
              </div>
            </Link>
            <MiniFavoriteButton favoritedProfileId={p.id} isFavorited={p.isFavorited} />
          </div>
        ))}
      </div>
    </section>
  );
}
