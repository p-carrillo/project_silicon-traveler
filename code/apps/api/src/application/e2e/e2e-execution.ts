export const E2E_ASSET_TTL_MS = 15 * 60_000;
export const E2E_MAX_ASSET_BYTES = 50 * 1024 * 1024;

export type E2EEventType = 'started' | 'progress' | 'result' | 'error' | 'completed';
export interface E2EExecutionEvent {
  type: E2EEventType;
  index: number;
  total: number;
  data?: Record<string, unknown>;
}

export interface E2EExecutionContext {
  readonly runId: string;
  readonly sessionId: string;
  readonly signal: AbortSignal;
  emit(event: E2EExecutionEvent): void;
  saveAsset(asset: { buffer: Buffer; contentType: string }): string;
}

export type E2ECommand = (context: E2EExecutionContext, input: unknown) => Promise<void>;

interface Asset { buffer: Buffer; contentType: string; expiresAt: number; }
interface Run { sessionId: string; controller: AbortController; assets: Map<string, Asset>; bytes: number; completed: boolean; cleanupTimer?: NodeJS.Timeout; }

export class E2EExecutionCoordinator {
  private readonly runs = new Map<string, Run>();
  private readonly activeSessionRuns = new Map<string, string>();
  private readonly commands = new Map<string, E2ECommand>();

  register(name: string, command: E2ECommand): void {
    // Commands are added by the follow-up Admin E2E tasks. Keeping this public
    // registry boundary avoids coupling the transport to a command implementation.
    this.commands.set(name, command);
  }
  getCommand(name: string): E2ECommand | undefined { return this.commands.get(name); }

  start(sessionId: string, emit: (event: E2EExecutionEvent) => void): { runId: string; context: E2EExecutionContext; complete: () => void } {
    if (this.activeSessionRuns.has(sessionId)) throw new E2EConflictError();
    const runId = crypto.randomUUID();
    const run: Run = { sessionId, controller: new AbortController(), assets: new Map(), bytes: 0, completed: false };
    this.runs.set(runId, run);
    this.activeSessionRuns.set(sessionId, runId);
    const context: E2EExecutionContext = {
      runId, sessionId, signal: run.controller.signal,
      emit,
      saveAsset: ({ buffer, contentType }) => this.saveAsset(runId, buffer, contentType),
    };
    return { runId, context, complete: () => this.complete(runId) };
  }

  cancel(sessionId: string, runId: string): boolean {
    const run = this.runs.get(runId);
    if (!run || run.sessionId !== sessionId) return false;
    if (!run.completed) run.controller.abort();
    return true;
  }

  getAsset(sessionId: string, runId: string, assetId: string): Asset | null {
    const run = this.runs.get(runId);
    const asset = run?.sessionId === sessionId ? run.assets.get(assetId) : undefined;
    if (!asset || asset.expiresAt <= Date.now()) return null;
    return asset;
  }

  private saveAsset(runId: string, buffer: Buffer, contentType: string): string {
    const run = this.runs.get(runId);
    if (!run) throw new Error('E2E execution is no longer active');
    if (run.bytes + buffer.length > E2E_MAX_ASSET_BYTES) throw new Error('E2E asset memory limit exceeded');
    const assetId = crypto.randomUUID();
    run.assets.set(assetId, { buffer, contentType, expiresAt: Date.now() + E2E_ASSET_TTL_MS });
    run.bytes += buffer.length;
    return assetId;
  }

  private complete(runId: string): void {
    const run = this.runs.get(runId);
    if (!run) return;
    this.activeSessionRuns.delete(run.sessionId);
    run.completed = true;
    run.cleanupTimer ??= setTimeout(() => this.runs.delete(runId), E2E_ASSET_TTL_MS);
  }
}

export class E2EConflictError extends Error { constructor() { super('An E2E execution is already active for this session'); } }
