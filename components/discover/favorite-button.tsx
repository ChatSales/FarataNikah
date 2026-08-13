import { Heart } from "lucide-react";
import { toggleFavoriteAction } from "@/actions/favorites";

export function FavoriteButton({
  favoritedProfileId,
  isFavorited,
}: {
  favoritedProfileId: string;
  isFavorited: boolean;
}) {
  return (
    <form action={toggleFavoriteAction}>
      <input type="hidden" name="favoritedProfileId" value={favoritedProfileId} />
      <button
        type="submit"
        aria-label={isFavorited ? "Retirer des favoris" : "Ajouter aux favoris"}
        className={`flex items-center gap-2 rounded-full border px-5 py-3 text-sm font-semibold transition ${
          isFavorited
            ? "border-gold-500 bg-gold-500/10 text-gold-600"
            : "border-primary-200 text-primary-800 hover:bg-primary-50"
        }`}
      >
        <Heart className={`h-4 w-4 ${isFavorited ? "fill-gold-500" : ""}`} />
        {isFavorited ? "Dans tes favoris" : "Ajouter aux favoris"}
      </button>
    </form>
  );
}
