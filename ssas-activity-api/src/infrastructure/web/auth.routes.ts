// src/infrastructure/web/auth.routes.ts

import { Router } from 'express';
import { register, login, me } from './auth.controller';
// import { authenticateJWT } from '../middlewares/auth.middleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
// router.get('/me', authenticateJWT, me);

export default router;
