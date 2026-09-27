import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import { pool } from '@silicon-traveler/shared';
import { isPrivateIp } from './lib/network';
import { createApiKeyMiddleware } from './middleware/auth.middleware';
import { photosRouter } from './routes/photos.routes';
import { journeyRouter } from './routes/journey.routes';
import { healthRouter } from './routes/health.routes';
import { mapRouter } from './routes/map.routes';
import { adminRouter } from './routes/admin.routes';

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.API_KEY;
const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:3001')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX_REQUESTS = 100;

// Middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', ...allowedOrigins],
      },
    },
  })
);
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      return callback(null, allowedOrigins.includes(origin));
    },
  })
);
app.use(express.json());
app.use(morgan('combined'));

// Rate limiting — skip for internal Docker network traffic (web, scheduler, etc.)
// NOTE: No reverse proxy is configured. If one is added in the future, set
// app.set('trust proxy', 1) so req.ip reflects the real client IP instead of
// the proxy's private address (which would bypass rate limiting entirely).
const limiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: RATE_LIMIT_MAX_REQUESTS,
  message: 'Too many requests from this IP, please try again later.',
  skip: (req) => isPrivateIp(req.ip),
});
app.use('/api', limiter);
if (process.env.NODE_ENV !== 'development') {
  app.use('/api', createApiKeyMiddleware(API_KEY));
}

// Static files - serve images
app.use('/images', express.static('/app/images'));

// Routes
app.use('/api/photos', photosRouter);
app.use('/api/journey', journeyRouter);
app.use('/api/map', mapRouter);
app.use('/api/admin', adminRouter);
app.use('/health', healthRouter);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 API server listening on port ${PORT}`);
});

// Graceful shutdown
function onShutdown(cleanup: () => Promise<void>): void {
  const handler = async (signal: string) => {
    console.log(`${signal} received, closing server...`);
    server.close(async () => {
      try {
        await cleanup();
      } catch (error) {
        console.error('Cleanup error:', error);
      }
      process.exit(0);
    });
  };
  process.on('SIGTERM', () => handler('SIGTERM'));
  process.on('SIGINT', () => handler('SIGINT'));
}

onShutdown(() => pool.end());
