import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { PhotosUploader, type ExistingPhoto } from "@/components/onboarding/photos-uploader";

export const metadata: Metadata = { title: "Tes photos" };

export default async function PhotosStepPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();
  if (!profile) redirect("/onboarding/basic-info");

  const { data: rows } = await supabase
    .from("profile_photos")
    .select("id, storage_path, is_primary")
    .eq("profile_id", profile.id)
    .order("position", { ascending: true });

  const existingPhotos: ExistingPhoto[] = await Promise.all(
    (rows ?? []).map(async (row) => {
      const { data: signed } = await supabase.storage
        .from("profile-photos")
        .createSignedUrl(row.storage_path, 60 * 60);
      return {
        id: row.id,
        signedUrl: signed?.signedUrl ?? null,
        isPrimary: row.is_primary,
      };
    })
  );

  return (
    <>
      <h1 className="text-center text-xl font-semibold text-primary-900">
        Ajoute tes photos
      </h1>
      <p className="mt-1.5 text-center text-sm text-primary-900/60">
        Au moins une photo est requise pour la vérification de ton profil.
      </p>

      <div className="mt-8">
        <PhotosUploader userId={user.id} existingPhotos={existingPhotos} />
      </div>

      <div className="mt-8 flex gap-3">
        <Link
          href="/onboarding/religious-practice"
          className="flex flex-1 items-center justify-center rounded-full border border-primary-200 py-3 text-sm font-semibold text-primary-700 transition hover:bg-primary-50"
        >
          Retour
        </Link>
        <Link
          href="/onboarding/privacy"
          className={`flex-1 rounded-full py-3 text-center text-sm font-semibold transition ${
            existingPhotos.length > 0
              ? "bg-primary-600 text-cream-50 hover:bg-primary-700"
              : "pointer-events-none bg-primary-100 text-primary-400"
          }`}
        >
          Continuer
        </Link>
      </div>
    </>
  );
}
