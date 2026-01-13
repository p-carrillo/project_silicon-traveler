import Link from "next/link";
import { StatusMessage } from "@/app/components/status-message";
import {
  buildMonthPath,
  formatMonthLabel,
  formatTravelDate,
} from "@/lib/date-helpers";
import { formatEntryLocation, resolveEntryImage } from "@/lib/entry-helpers";
import { fetchJourneyEntryByDate, getJourneyId } from "@/lib/journey-api";

type PageProps = {
  params: {
    year: string;
    month: string;
    day: string;
  };
};

export default async function JourneyEntryPage({ params }: PageProps) {
  const { year, month, day } = params;
  const yearNumber = Number(year);
  const monthNumber = Number(month);
  const dayNumber = Number(day);

  if (
    !/^\d{4}$/.test(year) ||
    !/^\d{2}$/.test(month) ||
    !/^\d{2}$/.test(day) ||
    monthNumber < 1 ||
    monthNumber > 12 ||
    dayNumber < 1 ||
    dayNumber > 31
  ) {
    return (
      <div className="page">
        <StatusMessage
          tone="error"
          title="Invalid date"
          description="Select a valid day from the monthly archive."
        />
      </div>
    );
  }

  const journeyId = getJourneyId();
  if (!journeyId) {
    return (
      <div className="page">
        <StatusMessage
          tone="error"
          title="Journey not configured"
          description="Set JOURNEY_ID to browse entries."
        />
      </div>
    );
  }

  const travelDate = `${year}-${month}-${day}`;
  const entryResult = await fetchJourneyEntryByDate(journeyId, travelDate);

  if (entryResult.error) {
    return (
      <div className="page">
        <StatusMessage
          tone="error"
          title="Unable to load this entry"
          description="Please try again soon."
        />
      </div>
    );
  }

  if (!entryResult.data) {
    return (
      <div className="page">
        <StatusMessage
          tone="empty"
          title="Entry not found"
          description="This day has no recorded photo yet."
        />
      </div>
    );
  }

  const entry = entryResult.data;
  const image = resolveEntryImage(entry, "web");
  const locationLabel = formatEntryLocation(entry);
  const dateLabel = formatTravelDate(entry.travel_date);
  const monthLabel = formatMonthLabel(yearNumber, monthNumber);

  return (
    <div className="page">
      <section className="detail">
        <Link
          href={buildMonthPath(yearNumber, monthNumber)}
          className="entry-date"
        >
          Back to {monthLabel}
        </Link>
        {image.url ? (
          <img
            src={image.url}
            alt={locationLabel}
            className="detail-image"
          />
        ) : null}
        <div>
          <div className="detail-meta">
            {locationLabel} · {dateLabel}
          </div>
          <p className="detail-text">{entry.text_body}</p>
          {image.fallback ? (
            <p className="hero-note">Using full-resolution image.</p>
          ) : null}
        </div>
      </section>
    </div>
  );
}
