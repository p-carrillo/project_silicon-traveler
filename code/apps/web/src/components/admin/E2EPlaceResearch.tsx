'use client';

import { useState, type FormEvent } from 'react';

interface Labels {
  researchTitle: string;
  researchDescription: string;
  location: string;
  locationPlaceholder: string;
  randomLocation: string;
  investigate: string;
  researching: string;
  geocoding: string;
  geocodeNotFound: string;
  geocodeFailed: string;
  geocodeStage: string;
  wikipediaStage: string;
  executionStage: string;
  coordinates: string;
  queryTitle: string;
  errorTitle: string;
  completed: string;
  sources: string;
  sourceTextTitle: string;
  sourceTextMissing: string;
  pageContentTitle: string;
  noResults: string;
  noMatchesReason: string;
  noSummaryReason: string;
  error: string;
}
interface EventData { type: string; index?: number; total?: number; data?: Record<string, unknown>; }
interface ResearchSource { title: string; url: string; text: string | null; content: string | null; }
interface PanelError { stage: string; message: string; }
interface GeocodedPlace {
  placeName: string | null;
  country: string | null;
  region: string | null;
  coordinates: { lat: number; lng: number };
}

export default function E2EPlaceResearch({ labels, geocodingLanguage }: { labels: Labels; geocodingLanguage: 'en' | 'es' }) {
  const [location, setLocation] = useState('');
  const [coordinates, setCoordinates] = useState<GeocodedPlace['coordinates'] | null>(null);
  const [query, setQuery] = useState('');
  const [summary, setSummary] = useState('');
  const [sources, setSources] = useState<ResearchSource[]>([]);
  const [hasResult, setHasResult] = useState(false);
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<PanelError | null>(null);

  async function selectRandomLocation(): Promise<void> {
    setBusy(true);
    clearResult();
    setStatus(labels.researching);
    try {
      await executeCommand('random-research-place', {}, (event) => {
        if (event.type !== 'result') return;
        const place = event.data?.place;
        if (!isRecord(place)) return;
        const fields = [place.placeName, place.region, place.country].filter((value): value is string => typeof value === 'string' && value.length > 0);
        setLocation(fields.join(', '));
        setStatus('');
      });
    } catch (cause: unknown) {
      setError(toPanelError(cause, labels.executionStage, labels.error));
      setStatus('');
    } finally {
      setBusy(false);
    }
  }

  async function investigate(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const enteredLocation = location.trim();
    if (!enteredLocation) return;
    setBusy(true);
    clearResult();
    setStatus(labels.geocoding);
    try {
      const place = await geocodeLocation(enteredLocation, labels, geocodingLanguage);
      const resolvedLocation = [place.placeName, place.region, place.country]
        .map((value) => value?.trim() ?? '')
        .filter((value): value is string => value.length > 0 && value.toLowerCase() !== 'unknown')
        .join(', ') || enteredLocation;
      setLocation(resolvedLocation);
      setCoordinates(place.coordinates);
      setStatus(labels.researching);
      const researchCity = place.placeName?.trim() || enteredLocation;
      await executeCommand('place-research', { location: researchCity }, (streamEvent) => {
        if (streamEvent.type === 'progress' && streamEvent.data?.stage === 'researching') {
          setQuery(readString(streamEvent.data.query) ?? '');
        } else if (streamEvent.type === 'result') {
          setQuery(readString(streamEvent.data?.query) ?? '');
          setSummary(readString(streamEvent.data?.summary) ?? '');
          setSources(readSources(streamEvent.data?.sources));
          setHasResult(true);
          const providerError = readString(streamEvent.data?.error);
          setError(providerError ? { stage: labels.wikipediaStage, message: providerError } : null);
          setStatus(labels.completed);
        } else if (streamEvent.type === 'error') {
          const message = readString(streamEvent.data?.message) ?? labels.error;
          const errorName = readString(streamEvent.data?.errorName);
          setError({ stage: labels.executionStage, message: errorName ? errorName + ': ' + message : message });
          setStatus('');
        }
      });
    } catch (cause: unknown) {
      setError(toPanelError(cause, labels.executionStage, labels.error));
      setStatus('');
    } finally {
      setBusy(false);
    }
  }

  function clearResult(): void {
    setCoordinates(null);
    setQuery('');
    setSummary('');
    setSources([]);
    setHasResult(false);
    setError(null);
    setStatus('');
  }

  return (
    <section aria-labelledby="place-research-title" className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <h2 id="place-research-title" className="text-xl font-bold text-zinc-950">{labels.researchTitle}</h2>
        <p className="text-sm text-zinc-700">{labels.researchDescription}</p>
      </div>
      <form onSubmit={(event) => void investigate(event)} className="flex flex-col gap-3">
        <label htmlFor="research-location" className="text-sm font-medium text-zinc-700">{labels.location}</label>
        <div className="flex flex-wrap gap-3">
          <input id="research-location" value={location} onChange={(event) => { setLocation(event.target.value); clearResult(); }} placeholder={labels.locationPlaceholder} maxLength={200} disabled={busy} className="min-w-64 flex-1 rounded-md border border-zinc-300 px-3 py-2 text-sm" />
          <button type="button" onClick={() => void selectRandomLocation()} disabled={busy} className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-800 disabled:cursor-not-allowed disabled:opacity-60">{labels.randomLocation}</button>
          <button type="submit" disabled={busy || !location.trim()} className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-zinc-500">{busy ? status : labels.investigate}</button>
        </div>
      </form>
      <p aria-live="polite" role="status" className="text-sm text-zinc-700">{status}</p>
      {error ? <section role="alert" className="rounded-md border border-red-300 bg-red-50 p-4 text-sm text-red-950">
        <h3 className="font-semibold">{labels.errorTitle}: {error.stage}</h3>
        <p className="mt-1 whitespace-pre-wrap">{error.message}</p>
      </section> : null}
      {coordinates ? <p className="text-sm text-zinc-600">{labels.coordinates}: {coordinates.lat}, {coordinates.lng}</p> : null}
      {query ? <section aria-labelledby="research-query-title" className="rounded-md border border-zinc-200 bg-white p-4">
        <h3 id="research-query-title" className="text-sm font-semibold text-zinc-950">{labels.queryTitle}</h3>
        <pre className="mt-2 whitespace-pre-wrap break-words text-sm text-zinc-700">{query}</pre>
      </section> : null}
      {hasResult ? <article className="flex flex-col gap-3 rounded-lg border border-zinc-200 bg-white p-4 md:p-6">
        <h3 className="font-bold text-zinc-950">{location}</h3>
        {summary ? <p className="whitespace-pre-wrap text-sm leading-6 text-zinc-700">{summary}</p> : <div>
          <p className="text-sm text-zinc-600">{labels.noResults}</p>
          {!error ? <p role="status" className="mt-1 text-sm text-amber-800">{sources.length ? labels.noSummaryReason : labels.noMatchesReason}</p> : null}
        </div>}
        {sources.length ? <section>
          <h4 className="font-semibold text-zinc-950">{labels.sources}</h4>
          <ul className="mt-2 space-y-4 text-sm">
            {sources.map((source) => <li key={source.url} className="rounded-md bg-zinc-50 p-3">
              <a href={source.url} target="_blank" rel="noreferrer" className="font-medium underline">{source.title}</a>
              <h5 className="mt-2 text-xs font-semibold uppercase tracking-wide text-zinc-600">{labels.sourceTextTitle}</h5>
              <p className="mt-1 whitespace-pre-wrap leading-6 text-zinc-700">{source.text || labels.sourceTextMissing}</p>
              {source.content ? <details className="mt-3 rounded border border-zinc-200 bg-white p-3">
                <summary className="cursor-pointer font-medium text-zinc-800">{labels.pageContentTitle}</summary>
                <pre className="mt-2 max-h-96 overflow-auto whitespace-pre-wrap break-words text-xs leading-5 text-zinc-700">{source.content}</pre>
              </details> : null}
            </li>)}
          </ul>
        </section> : null}
      </article> : null}
    </section>
  );
}

async function geocodeLocation(query: string, labels: Labels, language: 'en' | 'es'): Promise<GeocodedPlace> {
  const params = new URLSearchParams({ place_name: query });
  params.set('language', language);
  const response = await fetch('/admin/api/geocode?' + params.toString(), { method: 'GET', cache: 'no-store' });
  if (!response.ok) {
    const detail = await readHttpError(response);
    const message = response.status === 404 ? labels.geocodeNotFound : labels.geocodeFailed;
    throw new ResearchPanelError(labels.geocodeStage, message + ' (HTTP ' + response.status + '): ' + detail);
  }
  const payload: unknown = await response.json();
  if (!isRecord(payload) || !isRecord(payload.coordinates)) {
    throw new ResearchPanelError(labels.geocodeStage, labels.geocodeFailed + ': invalid geocoding response');
  }
  const { lat, lng } = payload.coordinates;
  if (typeof lat !== 'number' || !Number.isFinite(lat) || typeof lng !== 'number' || !Number.isFinite(lng)) {
    throw new ResearchPanelError(labels.geocodeStage, labels.geocodeFailed + ': invalid coordinates returned');
  }
  return {
    placeName: readString(payload.place_name),
    country: readString(payload.country),
    region: readString(payload.region),
    coordinates: { lat, lng },
  };
}

async function executeCommand(command: string, body: Record<string, unknown>, onEvent: (event: EventData) => void): Promise<void> {
  const response = await fetch('/admin/api/e2e/runs/' + encodeURIComponent(command), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok || !response.body) {
    const details = await readHttpError(response);
    throw new ResearchPanelError('execution', 'HTTP ' + response.status + (response.statusText ? ' ' + response.statusText : '') + ': ' + details);
  }
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  while (true) {
    const { value, done } = await reader.read();
    buffer += decoder.decode(value, { stream: !done });
    const frames = buffer.split('\n\n');
    buffer = frames.pop() ?? '';
    for (const frame of frames) {
      const dataLine = frame.split('\n').find((line) => line.startsWith('data:'));
      if (!dataLine) continue;
      try {
        const event: unknown = JSON.parse(dataLine.slice(5).trim());
        const parsedEvent = readEventData(event);
        if (parsedEvent) onEvent(parsedEvent);
      } catch { /* Ignore malformed stream frames. */ }
    }
    if (done) break;
  }
}

async function readHttpError(response: Response): Promise<string> {
  const body = await response.text();
  try {
    const parsed: unknown = JSON.parse(body);
    if (isRecord(parsed) && typeof parsed.error === 'string') return parsed.error;
  } catch { /* Keep the plain-text response when it is not JSON. */ }
  return body || response.statusText || 'No error detail returned';
}

function readSources(value: unknown): ResearchSource[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((source): ResearchSource[] => {
    if (!isRecord(source) || typeof source.title !== 'string' || typeof source.url !== 'string') return [];
    return [{ title: source.title, url: source.url, text: readString(source.text), content: readString(source.content) }];
  });
}
function readEventData(value: unknown): EventData | null {
  if (!isRecord(value) || typeof value.type !== 'string') return null;
  return {
    type: value.type,
    index: typeof value.index === 'number' ? value.index : undefined,
    total: typeof value.total === 'number' ? value.total : undefined,
    data: isRecord(value.data) ? value.data : undefined,
  };
}
function toPanelError(cause: unknown, fallbackStage: string, fallbackMessage: string): PanelError {
  if (cause instanceof ResearchPanelError) return { stage: cause.stage, message: cause.message };
  return { stage: fallbackStage, message: cause instanceof Error ? cause.message : fallbackMessage };
}
function readString(value: unknown): string | null { return typeof value === 'string' ? value : null; }
function isRecord(value: unknown): value is Record<string, unknown> { return typeof value === 'object' && value !== null; }
class ResearchPanelError extends Error { constructor(readonly stage: string, message: string) { super(message); } }
