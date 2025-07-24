// src/infrastructure/middlewares/auth.middleware.ts

import { Request, Response, NextFunction } from 'express';
// import { verifyToken } from '../../shared/jwt';
import { JwtTokenService } from '../../shared/jwt-token.service';

export async function authenticateJWT(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });

  const token = authHeader.split(' ')[1];
  try {
    const payload = await JwtTokenService.validateToken(token);
    req.user = payload.user; // Assuming the user object is added to the request
    // req.oAuthToken = payload.oAuthToken; // Assuming the OAuth token is added to


    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}
