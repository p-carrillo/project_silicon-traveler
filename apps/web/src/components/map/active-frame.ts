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
};

function toProxyImageSrc(path: string): string {
  const normalizedPath = path.replace(/^\//, '').replace(/^images\//, '');
  return `/api/images/${normalizedPath}`;
}

function toActiveFrame(source: ActiveFrameSource): ActiveFrame {
  return {
    title: source.title,
    location: source.location,
    narrative: source.narrative,
    imageSrc: toProxyImageSrc(source.thumbnail_path),
    publishedAt: source.published_at,
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
