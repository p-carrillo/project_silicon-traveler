import type { Request, Response, NextFunction } from 'express';

/**
 * Creates an Express middleware that validates API key authentication.
 *
 * Accepts the key via `Authorization: Bearer <token>` header or `x-api-key` header.
 * Returns 401 if the key is missing or invalid, 500 if no key is configured.
 *
 * @param apiKey - The expected API key value. Injected at composition time (DIP).
 */
export function createApiKeyMiddleware(apiKey: string | undefined) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!apiKey) {
      return res.status(500).json({ error: 'API key not configured' });
    }

    const authHeader = req.header('authorization');
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    const providedKey = bearerToken || req.header('x-api-key');

    if (!providedKey || providedKey !== apiKey) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    return next();
  };
}
