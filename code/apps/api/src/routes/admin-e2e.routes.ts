import { Router, type Request, type Response } from 'express';
import { OpenAIAdapter } from '@silicon-traveler/content';
import { DalleAdapter, SharpAdapter } from '@silicon-traveler/image';
import { PhotoPreparationCore } from '@silicon-traveler/photo';
import { BraveSearchAdapter } from '@silicon-traveler/research';
import { E2EConflictError, E2EExecutionCoordinator, type E2EExecutionEvent } from '../application/e2e/e2e-execution';
import { isE2EDevelopmentEnabled } from '../application/e2e/e2e-availability';
import { EphemeralPhotoExecution } from '../application/e2e/ephemeral-photo-execution';
import { E2EPreflightError, GenerateGlobalPhotoBatchUseCase } from '../application/e2e/generate-global-photo-batch.use-case';
import { RandomGlobalPlaceSelector } from '../adapters/e2e/random-global-place-selector';

export const adminE2ERouter: Router = Router();
const coordinator = new E2EExecutionCoordinator();

const llm = new OpenAIAdapter();
const photoCore = new PhotoPreparationCore(
  new BraveSearchAdapter(),
  llm,
  new DalleAdapter(),
  new SharpAdapter()
);
const globalPhotoBatch = new GenerateGlobalPhotoBatchUseCase(
  new RandomGlobalPlaceSelector(),
  new EphemeralPhotoExecution(photoCore)
);
coordinator.register('global-photos', async (context, input) => globalPhotoBatch.execute(context, input));

function sessionId(req: Request): string | null {
  const value = req.header('x-admin-e2e-session');
  return value && value.length <= 4096 ? value : null;
}

adminE2ERouter.post('/runs/:command', async (req: Request, res: Response): Promise<void> => {
  if (!isE2EDevelopmentEnabled()) { res.status(404).json({ error: 'Endpoint not found' }); return; }
  const session = sessionId(req);
  if (!session) { res.status(401).json({ error: 'Missing Admin E2E session' }); return; }
  const command = coordinator.getCommand(req.params.command);
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
      const message = error instanceof E2EPreflightError ? error.message : 'E2E execution failed';
      execution.context.emit({ type: 'error', index: 0, total: 0, data: { message } });
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
