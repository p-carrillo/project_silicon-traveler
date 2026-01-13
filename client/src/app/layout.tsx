import "./globals.css";
import { Fraunces, Manrope } from "next/font/google";
import { SiteHeader } from "./components/site-header";
import { JourneyMonth, buildJourneyMonths } from "@/lib/date-helpers";
import { fetchJourney, getJourneyId } from "@/lib/journey-api";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-display",
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-sans",
});

export const metadata = {
  title: {
    default: "Silicon Traveler",
    template: "%s | Silicon Traveler",
  },
  description:
    "A minimalist travel photo journal powered by daily AI-generated stories.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const journeyId = getJourneyId();
  let months: JourneyMonth[] = [];

  if (journeyId) {
    const journeyResult = await fetchJourney(journeyId);
    if (journeyResult.data?.start_date) {
      months = buildJourneyMonths(
        journeyResult.data.start_date,
        journeyResult.data.timezone,
      );
    }
  }

  return (
    <html lang="en">
      <body className={`${fraunces.variable} ${manrope.variable}`}>
        <div className="site-shell">
          <SiteHeader months={months} />
          <main className="site-main">{children}</main>
        </div>
      </body>
    </html>
  );
}
