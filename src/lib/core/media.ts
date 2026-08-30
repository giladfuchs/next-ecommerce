import type { Media } from "@/lib/core/types/payload-types";

export type MediaRelationship = Media["id"] | Media | null | undefined;
// gilad move to base api
export const createMediaResolver = async (
  relationships: MediaRelationship[],
  loadMedia: (ids: Media["id"][]) => Promise<Media[]>,
) => {
  const ids = Array.from(
    new Set(
      relationships
        .filter(
          (relationship): relationship is Media["id"] =>
            typeof relationship !== "object" && relationship != null,
        )
        .map(Number)
        .filter(Boolean),
    ),
  );
  const media = ids.length ? await loadMedia(ids) : [];
  const mediaById = new Map(
    media.map((mediaItem) => [String(mediaItem.id), mediaItem]),
  );

  return (relationship: MediaRelationship): MediaRelationship => {
    if (relationship == null || typeof relationship === "object") {
      return relationship;
    }

    return mediaById.get(String(relationship)) ?? relationship;
  };
};
