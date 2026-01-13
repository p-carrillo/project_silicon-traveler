import Link from "next/link";
import { JourneyMonth, buildMonthPath, formatMonthLabel } from "@/lib/date-helpers";

type SiteHeaderProps = {
  months: JourneyMonth[];
};

export function SiteHeader({ months }: SiteHeaderProps) {
  const hasMonths = months.length > 0;

  return (
    <header className="site-header">
      <Link href="/" className="brand">
        Silicon Traveler
      </Link>
      <nav className="site-nav" aria-label="Main navigation">
        {hasMonths ? (
          <details className="nav-details">
            <summary>Journey</summary>
            <div className="nav-dropdown">
              {months.map((month) => (
                <Link
                  key={`${month.year}-${month.month}`}
                  href={buildMonthPath(month.year, month.month)}
                  className="nav-item"
                >
                  {formatMonthLabel(month.year, month.month)}
                </Link>
              ))}
            </div>
          </details>
        ) : (
          <span className="nav-link muted">Journey</span>
        )}
        <Link href="/shop" className="nav-link">
          Shop
        </Link>
        <Link href="/about" className="nav-link">
          About
        </Link>
      </nav>
    </header>
  );
}
