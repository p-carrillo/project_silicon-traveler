export type JourneyMonth = {
  year: number;
  month: number;
};

export function formatMonthParam(month: number): string {
  return String(month).padStart(2, "0");
}

export function formatDayParam(day: number): string {
  return String(day).padStart(2, "0");
}

export function buildMonthPath(year: number, month: number): string {
  return `/journey/${year}/${formatMonthParam(month)}`;
}

export function buildEntryPath(
  year: number,
  month: number,
  day: number,
): string {
  return `/journey/${year}/${formatMonthParam(month)}/${formatDayParam(day)}`;
}

export function formatMonthLabel(year: number, month: number): string {
  const date = new Date(Date.UTC(year, month - 1, 1));
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(date);
}

export function parseTravelDateParts(
  dateValue: string,
): { year: number; month: number; day: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateValue);
  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  if (!year || month < 1 || month > 12 || day < 1 || day > 31) {
    return null;
  }

  return { year, month, day };
}

export function formatTravelDate(dateValue: string): string {
  const parsed = parseTravelDateParts(dateValue);
  if (!parsed) {
    return dateValue;
  }

  const date = new Date(Date.UTC(parsed.year, parsed.month - 1, parsed.day));
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "2-digit",
    year: "numeric",
  }).format(date);
}

type YearMonth = {
  year: number;
  month: number;
};

function getCurrentYearMonth(timezone?: string): YearMonth {
  const now = new Date();

  if (!timezone) {
    return { year: now.getUTCFullYear(), month: now.getUTCMonth() + 1 };
  }

  try {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
    });
    const parts = formatter.formatToParts(now);
    const year = Number(
      parts.find((part) => part.type === "year")?.value ??
        now.getUTCFullYear(),
    );
    const month = Number(
      parts.find((part) => part.type === "month")?.value ??
        now.getUTCMonth() + 1,
    );

    return { year, month };
  } catch {
    return { year: now.getUTCFullYear(), month: now.getUTCMonth() + 1 };
  }
}

export function buildJourneyMonths(
  startDate: string | null | undefined,
  timezone?: string,
): JourneyMonth[] {
  if (!startDate) {
    return [];
  }

  const match = /^(\d{4})-(\d{2})-\d{2}$/.exec(startDate);
  if (!match) {
    return [];
  }

  const startYear = Number(match[1]);
  const startMonth = Number(match[2]);
  if (!startYear || startMonth < 1 || startMonth > 12) {
    return [];
  }

  const end = getCurrentYearMonth(timezone);
  const months: JourneyMonth[] = [];
  let year = startYear;
  let month = startMonth;

  while (year < end.year || (year === end.year && month <= end.month)) {
    months.push({ year, month });
    month += 1;

    if (month > 12) {
      month = 1;
      year += 1;
    }
  }

  return months;
}
