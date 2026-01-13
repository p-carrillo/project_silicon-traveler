import type { CSSProperties } from "react";
import Link from "next/link";
import { StatusMessage } from "@/app/components/status-message";
import {
  buildEntryPath,
  formatMonthLabel,
  formatTravelDate,
  parseTravelDateParts,
} from "@/lib/date-helpers";
import { formatEntryLocation, resolveEntryImage } from "@/lib/entry-helpers";
import { fetchJourneyEntries, getJourneyId } from "@/lib/journey-api";

type PageProps = {
  params: {
    year: string;
    month: string;
  };
};

export default async function JourneyMonthPage({ params }: PageProps) {
  const { year, month } = params;
  const yearNumber = Number(year);
  const monthNumber = Number(month);

  if (
    !/^\d{4}$/.test(year) ||
    !/^\d{2}$/.test(month) ||
    monthNumber < 1 ||
    monthNumber > 12
  ) {
    return (
      <div className="page">
        <StatusMessage
          tone="error"
          title="Invalid month"
          description="Select a valid journey month from the menu."
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
          description="Set JOURNEY_ID to browse the archives."
        />
      </div>
    );
  }

  const monthLabel = formatMonthLabel(yearNumber, monthNumber);
  const entriesResult = await fetchJourneyEntries(journeyId, {
    month: `${year}-${month}`,
  });

  if (entriesResult.error) {
    return (
      <div className="page">
        <StatusMessage
          tone="error"
          title="Unable to load this month"
          description="Please try again soon."
        />
      </div>
    );
  }

  if (!entriesResult.data || entriesResult.data.length === 0) {
    return (
      <div className="page">
        <StatusMessage
          tone="empty"
          title="No photos for this month."
          description="Check back as the journey continues."
        />
      </div>
    );
  }

  return (
    <div className="page">
      <section>
        <h1 className="section-title">{monthLabel}</h1>
        <div className="month-grid">
          {entriesResult.data.map((entry, index) => {
            const image = resolveEntryImage(entry, "thumb");
            const locationLabel = formatEntryLocation(entry);
            const dateLabel = formatTravelDate(entry.travel_date);
            const dateParts = parseTravelDateParts(entry.travel_date);
            const entryPath = dateParts
              ? buildEntryPath(
                  dateParts.year,
                  dateParts.month,
                  dateParts.day,
                )
              : "#";

            const style = {
              "--stagger": `${index * 70}ms`,
            } as CSSProperties;

            return (
              <Link
                key={entry.id}
                href={entryPath}
                className="entry-card stagger-item"
                style={style}
              >
                {image.url ? (
                  <img
                    src={image.url}
                    alt={locationLabel}
                    className="entry-thumb"
                  />
                ) : null}
                <div className="entry-card-body">
                  <span className="entry-date">{dateLabel}</span>
                  <span className="entry-location">{locationLabel}</span>
                  {image.fallback ? (
                    <span className="entry-note">
                      Full-resolution fallback
                    </span>
                  ) : null}
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
