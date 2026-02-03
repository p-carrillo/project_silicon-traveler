export interface PhotoSearchFilter {
  whereClause: string;
  params: string[];
}

export interface PhotoSearchDateRange {
  startDate?: string | null;
  endDate?: string | null;
}

const DATE_PARAM_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export function parseDateParam(rawValue: unknown, fieldName: string): {
  value: string | null;
  error?: string;
} {
  if (rawValue === undefined || rawValue === null || rawValue === '') {
    return { value: null };
  }

  if (typeof rawValue !== 'string' || !DATE_PARAM_REGEX.test(rawValue)) {
    return { value: null, error: `${fieldName} must be in YYYY-MM-DD format` };
  }

  const [year, month, day] = rawValue.split('-').map(Number);
  const parsedDate = new Date(Date.UTC(year, month - 1, day));

  if (
    Number.isNaN(parsedDate.getTime()) ||
    parsedDate.getUTCFullYear() !== year ||
    parsedDate.getUTCMonth() + 1 !== month ||
    parsedDate.getUTCDate() !== day
  ) {
    return { value: null, error: `${fieldName} must be a valid date` };
  }

  return { value: rawValue };
}

const addDaysToDate = (dateString: string, days: number): string => {
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + days);

  const nextYear = date.getUTCFullYear();
  const nextMonth = String(date.getUTCMonth() + 1).padStart(2, '0');
  const nextDay = String(date.getUTCDate()).padStart(2, '0');
  return `${nextYear}-${nextMonth}-${nextDay}`;
};

export function buildPhotoSearchFilter(
  rawQuery: unknown,
  dateRange: PhotoSearchDateRange = {}
): PhotoSearchFilter {
  const query = typeof rawQuery === 'string' ? rawQuery.trim() : '';
  const clauses: string[] = [];
  const params: string[] = [];

  if (query) {
    const term = `%${query.toLowerCase()}%`;
    clauses.push(`(
      LOWER(title) LIKE ? OR
      LOWER(narrative) LIKE ? OR
      LOWER(location) LIKE ? OR
      LOWER(COALESCE(tags, '')) LIKE ?
    )`);
    params.push(term, term, term, term);
  }

  if (dateRange.startDate) {
    clauses.push('published_at >= ?');
    params.push(dateRange.startDate);
  }

  if (dateRange.endDate) {
    const exclusiveEnd = addDaysToDate(dateRange.endDate, 1);
    clauses.push('published_at < ?');
    params.push(exclusiveEnd);
  }

  const whereClause = clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '';

  return {
    whereClause,
    params,
  };
}
