import type { CSSProperties } from "react";
import Link from "next/link";
import { StatusMessage } from "@/app/components/status-message";
import {
  buildEntryPath,
  formatTravelDate,
  parseTravelDateParts,
} from "@/lib/date-helpers";
import { formatEntryLocation, resolveEntryImage } from "@/lib/entry-helpers";
import { fetchJourneyEntries, getJourneyId } from "@/lib/journey-api";

export default async function ShopPage() {
  const journeyId = getJourneyId();
  if (!journeyId) {
    return (
      <div className="page">
        <StatusMessage
          tone="error"
          title="Journey not configured"
          description="Set JOURNEY_ID to browse prints."
        />
      </div>
    );
  }

  const entriesResult = await fetchJourneyEntries(journeyId, {
    limit: 24,
    offset: 0,
  });

  if (entriesResult.error) {
    return (
      <div className="page">
        <StatusMessage
          tone="error"
          title="Unable to load the shop"
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
          title="No photos available yet."
          description="Prints will appear here once new entries arrive."
        />
      </div>
    );
  }

  return (
    <div className="page">
      <section>
        <h1 className="section-title">Print Shop</h1>
        <div className="entry-grid">
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
              <div key={entry.id} className="entry-card stagger-item" style={style}>
                <Link href={entryPath}>
                  {image.url ? (
                    <img
                      src={image.url}
                      alt={locationLabel}
                      className="entry-thumb"
                    />
                  ) : null}
                </Link>
                <div className="entry-card-body">
                  <span className="entry-date">{dateLabel}</span>
                  <span className="entry-location">{locationLabel}</span>
                  <button className="cta-button" type="button">
                    25 EUR print
                  </button>
                  {image.fallback ? (
                    <span className="entry-note">
                      Full-resolution fallback
                    </span>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
