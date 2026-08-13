"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ImagePlus, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { addProfilePhotoAction } from "@/actions/profile";

const MAX_FREE_PHOTOS = 3;
const MAX_FILE_SIZE_MB = 8;

export interface ExistingPhoto {
  id: string;
  signedUrl: string | null;
  isPrimary: boolean;
}

export function PhotosUploader({
  userId,
  existingPhotos,
}: {
  userId: string;
  existingPhotos: ExistingPhoto[];
}) {
  const [photos, setPhotos] = useState(existingPhotos);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setError(null);

    if (photos.length >= MAX_FREE_PHOTOS) {
      setError(
        `Le plan gratuit est limité à ${MAX_FREE_PHOTOS} photos. Passe Premium pour en ajouter jusqu'à 10.`
      );
      return;
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setError(`L'image ne doit pas dépasser ${MAX_FILE_SIZE_MB} Mo.`);
      return;
    }
    if (!file.type.startsWith("image/")) {
      setError("Seules les images sont acceptées.");
      return;
    }

    setUploading(true);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop();
      const path = `${userId}/${crypto.randomUUID()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("profile-photos")
        .upload(path, file, { upsert: false });
      if (uploadError) throw uploadError;

      await addProfilePhotoAction(path);

      const { data: signed } = await supabase.storage
        .from("profile-photos")
        .createSignedUrl(path, 60 * 60);

      setPhotos((prev) => [
        ...prev,
        {
          id: path,
          signedUrl: signed?.signedUrl ?? null,
          isPrimary: prev.length === 0,
        },
      ]);
      startTransition(() => router.refresh());
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Échec de l'envoi de la photo."
      );
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-3">
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="relative aspect-square overflow-hidden rounded-xl border border-primary-100 bg-primary-50"
          >
            {photo.signedUrl && (
              <Image
                src={photo.signedUrl}
                alt="Photo de profil"
                fill
                sizes="150px"
                className="object-cover"
              />
            )}
            {photo.isPrimary && (
              <span className="absolute bottom-1.5 left-1.5 rounded-full bg-primary-900/80 px-2 py-0.5 text-[10px] font-medium text-cream-50">
                Principale
              </span>
            )}
          </div>
        ))}

        {photos.length < MAX_FREE_PHOTOS && (
          <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-primary-200 text-primary-500 transition hover:border-primary-400 hover:text-primary-600">
            {uploading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <ImagePlus className="h-6 w-6" />
            )}
            <span className="text-xs font-medium">Ajouter</span>
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={handleFileChange}
              disabled={uploading || pending}
            />
          </label>
        )}
      </div>

      <p className="text-xs text-primary-900/50">
        {photos.length}/{MAX_FREE_PHOTOS} photos (plan gratuit). Elles seront
        floutées jusqu&apos;à validation d&apos;une demande de contact, selon
        tes réglages de confidentialité.
      </p>

      {error && (
        <p className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
