import Link from "next/link";
import { StatusMessage } from "@/app/components/status-message";
import {
  buildEntryPath,
  formatTravelDate,
  parseTravelDateParts,
} from "@/lib/date-helpers";
import { formatEntryLocation, resolveEntryImage } from "@/lib/entry-helpers";
import { fetchLatestEntry, getJourneyId } from "@/lib/journey-api";

export default async function Home() {
  const journeyId = getJourneyId();

  if (!journeyId) {
    return (
      <div className="page">
        <StatusMessage
          tone="error"
          title="Journey not configured"
          description="Set JOURNEY_ID to show the latest travel entry."
        />
      </div>
    );
  }

  const latestResult = await fetchLatestEntry(journeyId);

  if (latestResult.error) {
    return (
      <div className="page">
        <StatusMessage
          tone="error"
          title="Unable to load the latest entry"
          description="Please try again soon."
        />
      </div>
    );
  }

  if (!latestResult.data) {
    return (
      <div className="page">
        <StatusMessage
          tone="empty"
          title="No entries yet."
          description="The journey will appear here once the first photo is ready."
        />
      </div>
    );
  }

  const entry = latestResult.data;
  const image = resolveEntryImage(entry, "web");
  const locationLabel = formatEntryLocation(entry);
  const dateLabel = formatTravelDate(entry.travel_date);
  const dateParts = parseTravelDateParts(entry.travel_date);
  const entryPath = dateParts
    ? buildEntryPath(dateParts.year, dateParts.month, dateParts.day)
    : null;

  return (
    <div className="page">
      <section className="hero full-bleed">
        {image.url ? (
          <img
            src={image.url}
            alt={locationLabel}
            className="hero-image"
          />
        ) : null}
        <div className="hero-overlay">
          <div className="hero-meta">
            {locationLabel} · {dateLabel}
          </div>
          <h1 className="hero-title">Latest Journey</h1>
          <p className="hero-text">{entry.text_body}</p>
          {entryPath ? (
            <Link href={entryPath} className="cta-button">
              Read the day
            </Link>
          ) : null}
          {image.fallback ? (
            <p className="hero-note">Using full-resolution image.</p>
          ) : null}
        </div>
      </section>
    </div>
  );
}
