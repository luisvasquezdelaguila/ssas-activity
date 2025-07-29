// src/infrastructure/middleware/auth.middleware.ts

import { Request, Response, NextFunction } from 'express';
import { JwtTokenService } from '../../shared/jwt-token.service';

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: 'Token de acceso requerido' });
    }

    const { user } = await JwtTokenService.validateToken(token);
    (req as any).user = user;
    
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Token inválido o expirado' });
  }
};
