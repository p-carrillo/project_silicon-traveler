import { Router, type Request, type Response } from 'express';
import { E2EConflictError, E2EExecutionCoordinator, type E2EExecutionEvent } from '../application/e2e/e2e-execution';
import { isE2EDevelopmentEnabled } from '../application/e2e/e2e-availability';

export const adminE2ERouter: Router = Router();
const coordinator = new E2EExecutionCoordinator();

function sessionId(req: Request): string | null {
  const value = req.header('x-admin-e2e-session');
  return value && value.length <= 4096 ? value : null;
}

adminE2ERouter.post('/runs/:command', async (req: Request, res: Response): Promise<void> => {
  if (!isE2EDevelopmentEnabled()) { res.status(404).json({ error: 'Endpoint not found' }); return; }
  const session = sessionId(req);
  if (!session) { res.status(401).json({ error: 'Missing Admin E2E session' }); return; }
  const command = coordinator.getCommand(req.params.command);
  // The foundation intentionally registers no paid command. Future tasks add
  // them through the coordinator; unknown names never allocate a run.
  if (!command) { res.status(404).json({ error: 'E2E command not found' }); return; }
  const write = (event: E2EExecutionEvent): void => { res.write(`event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`); };
  try {
    const execution = coordinator.start(session, write);
    res.status(200);
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();
    const disconnect = (): void => coordinator.cancel(execution.runId);
    req.once('close', disconnect);
    try {
      execution.context.emit({ type: 'started', index: 0, total: 0, data: { runId: execution.runId } });
      await command(execution.context, req.body);
      execution.context.emit({ type: 'completed', index: 0, total: 0 });
    } catch (error: unknown) {
      execution.context.emit({ type: 'error', index: 0, total: 0, data: { message: 'E2E execution failed' } });
    } finally {
      req.off('close', disconnect);
      execution.complete();
      res.end();
    }
  } catch (error: unknown) {
    if (error instanceof E2EConflictError) { res.status(409).json({ error: error.message }); return; }
    res.status(500).json({ error: 'Unable to start E2E execution' });
  }
});

adminE2ERouter.get('/assets/:runId/:assetId', (req: Request, res: Response): void => {
  if (!isE2EDevelopmentEnabled()) { res.status(404).json({ error: 'Endpoint not found' }); return; }
  const session = sessionId(req);
  if (!session) { res.status(401).json({ error: 'Missing Admin E2E session' }); return; }
  const asset = coordinator.getAsset(session, req.params.runId, req.params.assetId);
  if (!asset) { res.status(404).json({ error: 'E2E asset not found' }); return; }
  res.setHeader('Content-Type', asset.contentType);
  res.setHeader('Cache-Control', 'no-store');
  res.send(asset.buffer);
});

export { coordinator };
