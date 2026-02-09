import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { verifyAccessToken, TokenPayload } from './auth-utils';

export interface AuthRequest extends Request {
  user?: TokenPayload;
  body: any;
}

// Rate limiter for general API endpoints
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000, 
  message: 'Too many login attempts, please try again later.',
});

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const payload = verifyAccessToken(token);
  if (!payload) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  req.user = payload;
  next();
}

export function requireRole(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const clientRole = req.body?.role || req.user.role;
    
    if (!roles.includes(clientRole)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    next();
  };
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  next();
}

export function requireEditorOrAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.user.role !== 'editor' && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Editor or admin access required' });
  }

  next();
}

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error('Error:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  if (process.env.NODE_ENV !== 'production') {
    return res.status(statusCode).json({
      error: message,
      stack: err.stack,
    });
  }

  res.status(statusCode).json({ error: message });
}
