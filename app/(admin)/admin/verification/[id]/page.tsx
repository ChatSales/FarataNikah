import { notFound } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { VerificationActions } from "@/components/admin/verification-actions";

export default async function AdminVerificationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!profile) notFound();

  const { data: photos } = await supabase
    .from("profile_photos")
    .select("id, storage_path, is_primary")
    .eq("profile_id", id)
    .order("position", { ascending: true });

  const photosWithUrls = await Promise.all(
    (photos ?? []).map(async (photo) => {
      const { data: signed } = await supabase.storage
        .from("profile-photos")
        .createSignedUrl(photo.storage_path, 60 * 15);
      return { ...photo, url: signed?.signedUrl ?? null };
    })
  );

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold text-primary-900">
        {profile.first_name} — {profile.gender === "male" ? "Homme" : "Femme"}
      </h1>
      <p className="text-sm text-primary-900/60">{profile.email}</p>

      <div className="mt-6 grid grid-cols-3 gap-3">
        {photosWithUrls.length === 0 && (
          <p className="col-span-3 text-sm text-primary-900/50">
            Aucune photo téléversée.
          </p>
        )}
        {photosWithUrls.map((photo) => (
          <div
            key={photo.id}
            className="relative aspect-square overflow-hidden rounded-xl border border-primary-100 bg-primary-50"
          >
            {photo.url && (
              <Image src={photo.url} alt="" fill sizes="200px" className="object-cover" />
            )}
            {photo.is_primary && (
              <span className="absolute bottom-1.5 left-1.5 rounded-full bg-primary-900/80 px-2 py-0.5 text-[10px] font-medium text-cream-50">
                Principale
              </span>
            )}
          </div>
        ))}
      </div>

      <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
        <div>
          <dt className="text-primary-900/50">Date de naissance</dt>
          <dd className="text-primary-900">{profile.date_of_birth}</dd>
        </div>
        <div>
          <dt className="text-primary-900/50">Localisation</dt>
          <dd className="text-primary-900">{profile.city}, {profile.country}</dd>
        </div>
        <div>
          <dt className="text-primary-900/50">Situation matrimoniale</dt>
          <dd className="text-primary-900">{profile.marital_status}</dd>
        </div>
        <div>
          <dt className="text-primary-900/50">Madhhab</dt>
          <dd className="text-primary-900">{profile.madhhab}</dd>
        </div>
        {profile.profession && (
          <div>
            <dt className="text-primary-900/50">Profession</dt>
            <dd className="text-primary-900">{profile.profession}</dd>
          </div>
        )}
        {profile.education_level && (
          <div>
            <dt className="text-primary-900/50">Études</dt>
            <dd className="text-primary-900">{profile.education_level}</dd>
          </div>
        )}
      </dl>

      {profile.religious_practice_level && (
        <div className="mt-6">
          <h2 className="text-sm font-semibold text-primary-900">Pratique religieuse</h2>
          <p className="mt-1 text-sm text-primary-900/75">{profile.religious_practice_level}</p>
        </div>
      )}

      {profile.bio && (
        <div className="mt-6">
          <h2 className="text-sm font-semibold text-primary-900">Bio</h2>
          <p className="mt-1 text-sm text-primary-900/75">{profile.bio}</p>
        </div>
      )}

      <div className="mt-10 border-t border-primary-100 pt-8">
        <VerificationActions profileId={profile.id} />
      </div>
    </div>
  );
}
