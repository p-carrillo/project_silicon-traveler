'use client';

import { useRef, useState, type ReactNode } from 'react';

interface E2EPhotoBatchLabels {
  photosTitle: string;
  photosDescription: string;
  costNotice: string;
  quantity: string;
  start: string;
  photo: string;
  photos: string;
  running: string;
  stop: string;
  stopping: string;
  stopped: string;
  progress: string;
  selectingPlaces: string;
  preparingPhoto: string;
  completed: string;
  error: string;
  errorsTitle: string;
  research: string;
  sources: string;
  translations: string;
  close: string;
  connectors: string;
  connectorResearch: string;
  connectorContent: string;
  connectorImage: string;
  connectorThumbnails: string;
  connectorPending: string;
  connectorRunning: string;
  connectorSuccess: string;
  connectorError: string;
  imagePrompt: string;
  revisedPrompt: string;
  visualDirection: string;
  reflection: string;
  sourceAnchor: string;
  subject: string;
  setting: string;
  composition: string;
  lightWeather: string;
  visualConstraints: string;
  negativeConstraints: string;
  camera: string;
  noResults: string;
}

interface Place { placeName: string; country: string; region: string | null; }
interface CameraMetadata { camera: string; lens: string; iso: number; shutterSpeed: string; aperture: string; }
interface Result extends Place {
  status: 'pending' | 'preparing' | 'success' | 'error';
  imageAssetId?: string;
  narrative?: string;
  imagePrompt?: string;
  cameraMetadata?: CameraMetadata;
  researchSummary?: string;
  researchSources?: Array<{ title: string; url: string }>;
  translations?: Array<{ language: string; imagePrompt: string; narrative: string }>;
  visualBrief?: VisualBrief;
  revisedPrompt?: string;
  connectors: Record<Connector, ConnectorStatus>;
  errorMessage?: string;
}

interface VisualBrief { category: string; reflection?: string; anchor: string; anchorSource: string; subject: string; setting: string; composition: string; timeAndWeather: string; visualConstraints: string[]; negativeConstraints: string[]; originalPrompt?: string; revisedPrompt?: string | null; }

interface StreamEvent { type: string; index: number; total: number; data?: Record<string, unknown>; }
type Connector = 'research' | 'content' | 'image' | 'thumbnails';
type ConnectorStatus = 'pending' | 'running' | 'success' | 'error';
const initialConnectors: Record<Connector, ConnectorStatus> = { research: 'pending', content: 'pending', image: 'pending', thumbnails: 'pending' };

export default function E2EPhotoBatch({ labels }: { labels: E2EPhotoBatchLabels }) {
  const [results, setResults] = useState<Result[]>([]);
  const [runId, setRunId] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const [completed, setCompleted] = useState(0);
  const [count, setCount] = useState(10);
  const [status, setStatus] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const cancelController = useRef<AbortController | null>(null);
  const activeRunId = useRef<string | null>(null);
  const stopRequested = useRef(false);

  async function start(): Promise<void> {
    setResults([]);
    setRunId(null);
    activeRunId.current = null;
    stopRequested.current = false;
    const controller = new AbortController();
    cancelController.current = controller;
    setIsStopping(false);
    setCompleted(0);
    setErrors([]);
    setStatus(labels.selectingPlaces);
    setIsRunning(true);
    try {
      const response = await fetch('/admin/api/e2e/runs/global-photos', {
        method: 'POST',
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count }),
      });
      if (!response.ok || !response.body) throw new Error('Unable to start the global photo batch');
      await readEventStream(response.body, (event) => applyEvent(event));
    } catch (error: unknown) {
      if (stopRequested.current) setStatus(labels.stopped);
      else {
        const message = error instanceof Error ? error.message : labels.error;
        setStatus(message);
        addError(message);
      }
    } finally {
      cancelController.current = null;
      activeRunId.current = null;
      setIsRunning(false);
    }
  }

  async function stop(): Promise<void> {
    const currentRunId = activeRunId.current;
    if (!currentRunId || stopRequested.current) return;
    stopRequested.current = true;
    setIsStopping(true);
    setStatus(labels.stopping);
    try {
      const response = await fetch(`/admin/api/e2e/runs/${encodeURIComponent(currentRunId)}/cancel`, { method: 'POST' });
      if (!response.ok) throw new Error('Unable to stop the photo batch');
      cancelController.current?.abort();
      setStatus(labels.stopped);
    } catch (error: unknown) {
      stopRequested.current = false;
      setIsStopping(false);
      const message = error instanceof Error ? error.message : labels.error;
      setStatus(message);
      addError(message);
    }
  }

  function applyEvent(event: StreamEvent): void {
    if (event.type === 'started') {
      const nextRunId = readString(event.data?.runId);
      if (nextRunId) { activeRunId.current = nextRunId; setRunId(nextRunId); }
      return;
    }
    if (event.type === 'progress' && event.data?.stage === 'places_selected') {
      const places = readPlaces(event.data.places);
      setResults(places.map((place) => ({ ...place, status: 'pending', connectors: { ...initialConnectors } })));
      setStatus(progressLabel(labels, 0, event.total));
      return;
    }
    if (event.type === 'progress' && event.data?.stage === 'preparing_photo') {
      updateResult(event.index, (result) => ({ ...result, status: 'preparing' }));
      setStatus(`${labels.preparingPhoto}: ${event.index}/${event.total}`);
      return;
    }
    if (event.type === 'progress' && event.data?.stage === 'connector') {
      const connector = readConnector(event.data.connector);
      const connectorStatus = readConnectorStatus(event.data.status);
      if (connector && connectorStatus) updateResult(event.index, (result) => ({ ...result, connectors: { ...result.connectors, [connector]: connectorStatus } }));
      return;
    }
    if (event.type === 'progress' && event.data?.stage === 'research_completed') {
      updateResult(event.index, (result) => ({ ...result, researchSummary: readString(event.data?.researchSummary) }));
      return;
    }
    if (event.type === 'progress' && event.data?.stage === 'research_sources') {
      updateResult(event.index, (result) => ({ ...result, researchSources: readSources(event.data?.sources) }));
      return;
    }
    if (event.type === 'progress' && event.data?.stage === 'content_completed') {
      updateResult(event.index, (result) => ({ ...result, ...readResult(event.data) }));
      return;
    }
    if (event.type === 'result') {
      updateResult(event.index, (result) => ({ ...result, ...readResult(event.data), status: 'success' }));
      setCompleted(event.index);
      setStatus(progressLabel(labels, event.index, event.total));
      return;
    }
    if (event.type === 'error' && event.index > 0) {
      const place = readPlace(event.data?.place);
      const message = readString(event.data?.message) ?? labels.error;
      const connector = readConnector(event.data?.connector);
      updateResult(event.index, (result) => ({ ...result, ...(place ?? {}), status: 'error', errorMessage: message, connectors: connector ? { ...result.connectors, [connector]: 'error' } : result.connectors }));
      setCompleted(event.index);
      setStatus(progressLabel(labels, event.index, event.total));
      addError(place ? `${place.placeName}: ${message}` : message);
      return;
    }
    if (event.type === 'error') {
      const message = readString(event.data?.message) ?? labels.error;
      setStatus(message);
      addError(message);
      return;
    }
    if (event.type === 'completed') { setStatus(labels.completed); setIsRunning(false); }
  }

  function updateResult(index: number, update: (result: Result) => Result): void {
    setResults((current) => current.map((result, position) => position === index - 1 ? update(result) : result));
  }

  function addError(message: string): void {
    setErrors((current) => current.includes(message) ? current : [...current, message]);
  }

  return (
    <section aria-labelledby="global-photo-batch-title" className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <h2 id="global-photo-batch-title" className="text-xl font-bold text-zinc-950">{labels.photosTitle}</h2>
        <p className="text-sm text-zinc-700">{labels.photosDescription}</p>
        <p className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950">{labels.costNotice}</p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-zinc-700">
          {labels.quantity}
          <input type="number" min={1} max={10} value={count} disabled={isRunning} onChange={(event) => setCount(clampCount(event.target.value))} className="w-16 rounded-md border border-zinc-300 px-2 py-1" />
        </label>
        <button type="button" onClick={() => void start()} disabled={isRunning} className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-zinc-500">
          {isRunning ? labels.running : `${labels.start} ${count} ${count === 1 ? labels.photo : labels.photos}`}
        </button>
        {isRunning ? <button type="button" onClick={() => void stop()} disabled={!runId || isStopping} className="rounded-md border border-red-300 px-4 py-2 text-sm font-semibold text-red-800 disabled:cursor-not-allowed disabled:opacity-50">{isStopping ? labels.stopping : labels.stop}</button> : null}
        <p aria-live="polite" role="status" className="text-sm text-zinc-700">{status}</p>
      </div>
      <div aria-label={progressLabel(labels, completed, count)} aria-valuemax={count} aria-valuemin={0} aria-valuenow={completed} role="progressbar" className="h-3 overflow-hidden rounded-full bg-zinc-200">
        <div className="h-full bg-zinc-900 transition-[width]" style={{ width: `${(completed / count) * 100}%` }} />
      </div>
      {errors.length > 0 ? <section aria-live="assertive" role="alert" className="rounded-md border border-red-300 bg-red-50 p-4 text-sm text-red-950">
        <h3 className="font-semibold">{labels.errorsTitle}</h3>
        <ul className="mt-2 list-disc space-y-1 pl-5">{errors.map((error) => <li key={error}>{error}</li>)}</ul>
      </section> : null}
      {results.length === 0 ? <p className="text-sm text-zinc-600">{labels.noResults}</p> : <ol className="flex flex-col gap-4">{results.map((result, index) => <li key={`${result.placeName}-${index}`}><ResultCard result={result} index={index + 1} total={count} runId={runId} labels={labels} /></li>)}</ol>}
    </section>
  );
}

function ResultCard({ result, index, total, runId, labels }: { result: Result; index: number; total: number; runId: string | null; labels: E2EPhotoBatchLabels }) {
  const imageUrl = runId && result.imageAssetId ? `/admin/api/e2e/assets/${encodeURIComponent(runId)}/${encodeURIComponent(result.imageAssetId)}` : null;
  return <article className="overflow-hidden rounded-lg border border-zinc-200 bg-white md:grid md:grid-cols-[minmax(16rem,28rem)_1fr]">
    {imageUrl ? <img src={imageUrl} alt={`${result.placeName}, ${result.country}`} width={640} height={640} className="h-auto w-full self-start bg-zinc-100 object-contain" /> : <div className="aspect-square bg-zinc-100" aria-hidden="true" />}
    <div className="flex flex-col gap-3 p-4 md:p-6">
      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">{index}/{total} · {result.status}</p>
      <h3 className="font-bold text-zinc-950">{[result.placeName, result.region, result.country].filter(Boolean).join(', ')}</h3>
      {result.narrative ? <p className="text-sm text-zinc-700">{result.narrative}</p> : null}
      {(result.visualBrief?.originalPrompt || result.imagePrompt) ? <p className="text-xs text-zinc-600"><span className="font-semibold">{labels.imagePrompt}:</span> {result.visualBrief?.originalPrompt ?? result.imagePrompt}</p> : null}
      {result.visualBrief?.revisedPrompt ? <p className="text-xs text-zinc-600"><span className="font-semibold">{labels.revisedPrompt}:</span> {result.visualBrief.revisedPrompt}</p> : null}
      {result.cameraMetadata ? <p className="text-xs text-zinc-600"><span className="font-semibold">{labels.camera}:</span> {result.cameraMetadata.camera}, {result.cameraMetadata.lens} · ISO {result.cameraMetadata.iso} · {result.cameraMetadata.shutterSpeed} · f/{result.cameraMetadata.aperture}</p> : null}
      {result.researchSummary ? <section className="rounded-md bg-zinc-50 p-3 text-sm text-zinc-700"><h4 className="font-semibold text-zinc-950">{labels.research}</h4><p className="mt-1">{result.researchSummary}</p></section> : null}
      <div className="flex flex-wrap gap-2">{result.visualBrief ? <Popup label={labels.visualDirection} close={labels.close}><section className="flex flex-col gap-2 text-sm"><p><span className="font-semibold">{labels.visualDirection}:</span> {result.visualBrief.category}</p>{result.visualBrief.reflection ? <p><span className="font-semibold">{labels.reflection}:</span> {result.visualBrief.reflection}</p> : null}<p><span className="font-semibold">{labels.sourceAnchor}:</span> ({result.visualBrief.anchorSource}) {result.visualBrief.anchor}</p><p><span className="font-semibold">{labels.subject}:</span> {result.visualBrief.subject}</p><p><span className="font-semibold">{labels.setting}:</span> {result.visualBrief.setting}</p><p><span className="font-semibold">{labels.composition}:</span> {result.visualBrief.composition}</p><p><span className="font-semibold">{labels.lightWeather}:</span> {result.visualBrief.timeAndWeather}</p><div><h5 className="font-semibold">{labels.visualConstraints}</h5><ul className="list-disc pl-5">{result.visualBrief.visualConstraints.map((item) => <li key={item}>{item}</li>)}</ul></div><div><h5 className="font-semibold">{labels.negativeConstraints}</h5><ul className="list-disc pl-5">{result.visualBrief.negativeConstraints.map((item) => <li key={item}>{item}</li>)}</ul></div></section></Popup> : null}{result.researchSources?.length ? <Popup label={labels.sources} close={labels.close}><ul className="list-disc space-y-2 pl-5">{result.researchSources.map((source) => <li key={source.url}><a href={source.url} target="_blank" rel="noreferrer" className="underline">{source.title}</a></li>)}</ul></Popup> : null}{result.translations?.length ? <Popup label={labels.translations} close={labels.close}><div className="flex flex-col gap-4">{result.translations.map((translation) => <section key={translation.language}><h5 className="font-semibold">{translation.language}</h5><p className="mt-1 text-sm">{translation.narrative}</p><p className="mt-1 text-xs text-zinc-600">{translation.imagePrompt}</p></section>)}</div></Popup> : null}</div>
      <ConnectorStatuses connectors={result.connectors} labels={labels} />
      {result.errorMessage ? <p role="alert" className="text-sm font-medium text-red-700">{result.errorMessage}</p> : null}
    </div>
  </article>;
}

async function readEventStream(stream: ReadableStream<Uint8Array>, onEvent: (event: StreamEvent) => void): Promise<void> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  while (true) {
    const { done, value } = await reader.read();
    buffer += decoder.decode(value, { stream: !done });
    const messages = buffer.split('\n\n');
    buffer = messages.pop() ?? '';
    for (const message of messages) {
      const data = message.split('\n').find((line) => line.startsWith('data: '))?.slice(6);
      if (!data) continue;
      const event = parseEvent(data);
      if (event) onEvent(event);
    }
    if (done) return;
  }
}

function parseEvent(value: string): StreamEvent | null {
  try {
    const parsed: unknown = JSON.parse(value);
    return isRecord(parsed) && typeof parsed.type === 'string' && typeof parsed.index === 'number' && typeof parsed.total === 'number'
      ? { type: parsed.type, index: parsed.index, total: parsed.total, data: isRecord(parsed.data) ? parsed.data : undefined }
      : null;
  } catch { return null; }
}

function readPlaces(value: unknown): Place[] { return Array.isArray(value) ? value.map(readPlace).filter((place): place is Place => place !== null) : []; }
function readPlace(value: unknown): Place | null { if (!isRecord(value)) return null; const placeName = readString(value.placeName); const country = readString(value.country); const region = value.region === null ? null : readString(value.region); return placeName && country && region !== undefined ? { placeName, country, region } : null; }
function readResult(value: unknown): Partial<Result> {
  if (!isRecord(value)) return {};
  return {
    imageAssetId: readString(value.imageAssetId),
    narrative: readString(value.narrative),
    imagePrompt: readString(value.imagePrompt),
    researchSummary: readString(value.researchSummary),
    translations: readTranslations(value.translations),
    cameraMetadata: readCameraMetadata(value.cameraMetadata),
    visualBrief: readVisualBrief(value.visualBrief),
    revisedPrompt: readString(value.revisedPrompt),
  };
}
function readVisualBrief(value: unknown): VisualBrief | undefined {
  if (!isRecord(value)) return undefined;
  const category = readString(value.category);
  const anchor = readString(value.anchor);
  const anchorSource = value.anchorSource === 'research' || value.anchorSource === 'route' ? value.anchorSource : undefined;
  const subject = readString(value.subject);
  const setting = readString(value.setting);
  const composition = readString(value.composition);
  const timeAndWeather = readString(value.timeAndWeather);
  const visualConstraints = readStringArray(value.visualConstraints);
  const negativeConstraints = readStringArray(value.negativeConstraints);
  if (!category || !anchor || !anchorSource || !subject || !setting || !composition || !timeAndWeather || !visualConstraints || !negativeConstraints) return undefined;
  return { category, reflection: readString(value.reflection), anchor, anchorSource, subject, setting, composition, timeAndWeather, visualConstraints, negativeConstraints, originalPrompt: readString(value.originalPrompt), revisedPrompt: value.revisedPrompt === null ? null : readString(value.revisedPrompt) };
}
function readStringArray(value: unknown): string[] | undefined { return Array.isArray(value) && value.every((item) => typeof item === 'string') ? value : undefined; }
function readCameraMetadata(value: unknown): CameraMetadata | undefined {
  if (!isRecord(value)) return undefined;
  const camera = readString(value.camera);
  const lens = readString(value.lens);
  const shutterSpeed = readString(value.shutterSpeed);
  const aperture = readString(value.aperture);
  return camera && lens && typeof value.iso === 'number' && shutterSpeed && aperture
    ? { camera, lens, iso: value.iso, shutterSpeed, aperture }
    : undefined;
}
function readSources(value: unknown): Array<{ title: string; url: string }> { return Array.isArray(value) ? value.flatMap((source) => isRecord(source) && readString(source.title) && readString(source.url) ? [{ title: readString(source.title)!, url: readString(source.url)! }] : []) : []; }
function readTranslations(value: unknown): Array<{ language: string; imagePrompt: string; narrative: string }> { return Array.isArray(value) ? value.flatMap((translation) => isRecord(translation) && readString(translation.language) && readString(translation.imagePrompt) && readString(translation.narrative) ? [{ language: readString(translation.language)!, imagePrompt: readString(translation.imagePrompt)!, narrative: readString(translation.narrative)! }] : []) : []; }
function progressLabel(labels: E2EPhotoBatchLabels, completed: number, total: number): string {
  return `${completed}/${total} ${labels.progress}`;
}
function clampCount(value: string): number {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? Math.min(10, Math.max(1, parsed)) : 1;
}
function readConnector(value: unknown): Connector | undefined { return value === 'research' || value === 'content' || value === 'image' || value === 'thumbnails' ? value : undefined; }
function readConnectorStatus(value: unknown): ConnectorStatus | undefined { return value === 'running' || value === 'success' || value === 'error' ? value : undefined; }

function ConnectorStatuses({ connectors, labels }: { connectors: Record<Connector, ConnectorStatus>; labels: E2EPhotoBatchLabels }) {
  const entries: Array<[Connector, string]> = [
    ['research', labels.connectorResearch], ['content', labels.connectorContent], ['image', labels.connectorImage], ['thumbnails', labels.connectorThumbnails],
  ];
  return <section aria-label={labels.connectors} className="rounded-md border border-zinc-200 p-3 text-sm">
    <h4 className="font-semibold text-zinc-950">{labels.connectors}</h4>
    <ul className="mt-2 grid gap-2 sm:grid-cols-2">{entries.map(([connector, label]) => <li key={connector} className="flex items-center justify-between gap-3"><span>{label}</span><ConnectorStatus status={connectors[connector]} labels={labels} /></li>)}</ul>
  </section>;
}

function ConnectorStatus({ status, labels }: { status: ConnectorStatus; labels: E2EPhotoBatchLabels }) {
  const label = status === 'running' ? labels.connectorRunning : status === 'success' ? labels.connectorSuccess : status === 'error' ? labels.connectorError : labels.connectorPending;
  const color = status === 'success' ? 'bg-emerald-100 text-emerald-900' : status === 'error' ? 'bg-red-100 text-red-900' : status === 'running' ? 'bg-amber-100 text-amber-900' : 'bg-zinc-100 text-zinc-700';
  return <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${color}`}>{label}</span>;
}

function Popup({ label, close, children }: { label: string; close: string; children: ReactNode }) {
  return <><button type="button" onClick={(event) => (event.currentTarget.nextElementSibling as HTMLDialogElement | null)?.showModal()} className="rounded-md border border-zinc-300 px-3 py-1 text-sm font-semibold">{label}</button><dialog className="w-full max-w-2xl rounded-lg p-0 backdrop:bg-black/40"><div className="max-h-[80vh] overflow-y-auto p-6"><div className="flex justify-end"><form method="dialog"><button type="submit" className="rounded-md border border-zinc-300 px-3 py-1 text-sm">{close}</button></form></div><div className="mt-4">{children}</div></div></dialog></>;
}
function readString(value: unknown): string | undefined { return typeof value === 'string' && value.trim() ? value : undefined; }
function isRecord(value: unknown): value is Record<string, unknown> { return typeof value === 'object' && value !== null; }
