import { JourneyEntry } from "./journey-api";

export function formatEntryLocation(entry: JourneyEntry): string {
  if (!entry.location) {
    return "Unknown location";
  }

  const parts = [
    entry.location.title,
    entry.location.city,
    entry.location.country,
  ].filter(Boolean) as string[];
  const uniqueParts = Array.from(new Set(parts));

  return uniqueParts.length > 0 ? uniqueParts.join(", ") : "Unknown location";
}

export function resolveEntryImage(
  entry: JourneyEntry,
  preferred: "web" | "thumb" | "full",
): { url: string | null; fallback: boolean } {
  const preferredUrl =
    preferred === "web"
      ? entry.image_url_web
      : preferred === "thumb"
        ? entry.image_url_thumb
        : entry.image_url_full;

  if (preferredUrl) {
    return { url: preferredUrl, fallback: false };
  }

  const fallbackUrl =
    entry.image_url_full || entry.image_url_web || entry.image_url_thumb;

  return { url: fallbackUrl ?? null, fallback: Boolean(fallbackUrl) };
}
