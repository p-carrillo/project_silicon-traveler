import { Router, type Request, type Response } from 'express';
import { pool } from '@silicon-traveler/shared';

export const healthRouter: Router = Router();

healthRouter.get('/', async (_req: Request, res: Response) => {
  try {
    // Test database connection
    await pool.query('SELECT 1');
    
    return res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
    });
  } catch (error) {
    console.error('Health check failed:', error);
    return res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});
