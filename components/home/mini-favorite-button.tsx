import { Star } from "lucide-react";
import { toggleFavoriteAction } from "@/actions/favorites";

export function MiniFavoriteButton({
  favoritedProfileId,
  isFavorited,
}: {
  favoritedProfileId: string;
  isFavorited: boolean;
}) {
  return (
    <form action={toggleFavoriteAction} className="absolute right-2 top-2">
      <input type="hidden" name="favoritedProfileId" value={favoritedProfileId} />
      <button
        type="submit"
        aria-label={isFavorited ? "Retirer des favoris" : "Ajouter aux favoris"}
        className="flex h-7 w-7 items-center justify-center rounded-full bg-cream-50/90 text-primary-700 shadow-sm transition hover:bg-cream-50"
      >
        <Star className={`h-3.5 w-3.5 ${isFavorited ? "fill-gold-500 text-gold-500" : ""}`} />
      </button>
    </form>
  );
}
