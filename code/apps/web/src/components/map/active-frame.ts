import { toProxyImageSrc } from '../../lib/images';

type ActiveFrameSource = {
  title: string;
  location: string;
  narrative: string;
  thumbnail_path: string;
  published_at: string;
};

export type ActiveFrame = {
  title: string;
  location: string;
  narrative: string;
  imageSrc: string;
  publishedAt: string;
  dateSlug: string;
};

function toDateSlug(publishedAt: string): string {
  const match = publishedAt.match(/^\d{4}-\d{2}-\d{2}/);
  if (match) return match[0];
  const parsed = new Date(publishedAt);
  if (Number.isNaN(parsed.getTime())) return '';
  return parsed.toISOString().slice(0, 10);
}

function toActiveFrame(source: ActiveFrameSource): ActiveFrame {
  return {
    title: source.title,
    location: source.location,
    narrative: source.narrative,
    imageSrc: toProxyImageSrc(source.thumbnail_path),
    publishedAt: source.published_at,
    dateSlug: toDateSlug(source.published_at),
  };
}

export function resolveActiveFrame(
  selectedPin: ActiveFrameSource | null,
  latestPhoto: ActiveFrameSource | null
): ActiveFrame | null {
  if (selectedPin) return toActiveFrame(selectedPin);
  if (latestPhoto) return toActiveFrame(latestPhoto);
  return null;
}
