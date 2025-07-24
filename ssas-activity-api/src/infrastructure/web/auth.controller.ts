// src/infrastructure/web/auth.controller.ts

import { Request, Response } from 'express';
// import { signToken } from '../../shared/jwt';
import UserModel from '../db/user.model';
import bcrypt from 'bcryptjs';
import authConfig from '../../config/auth.config';
import moment from 'moment-timezone';
import appConfig from '../../config/env/server';
import { generateUniqueTokenId } from '../../shared/helper';
import { OAuthAccessTokenModel } from '../db/oauth-access-token.model';
import { JwtTokenService } from '../../shared/jwt-token.service';
// import { User } from '../../domain/user.entity';
import {toUserEntity} from '../../shared/user-mapper';




export const register = async (req: Request, res: Response) => {
    try {
        const { email, name, password, role, companyId, areaId } = req.body;
        const existing = await UserModel.findOne({ email });
        if (existing) return res.status(400).json({ error: 'Email already exists' });
        const hashed = await bcrypt.hash(password, 10);
        const user = await UserModel.create({ email, name, password: hashed, role, companyId, areaId, isActive: true });
        res.status(201).json({ id: user._id, email: user.email, name: user.name, role: user.role });
    } catch (error) {
        res.status(400).json({ error: (error as Error).message });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const user = await UserModel.findOne({ email });
        if (!user || !user.isActive) return res.status(401).json({ error: 'Invalid credentials' });
        const currentUserPassword = '$2b$' + user.password.substring(4);
        const isMatch = await bcrypt.compare(password, currentUserPassword);
        if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });
        let token =  await JwtTokenService.buildTokenPayload(toUserEntity(user));
        res.json({
            acesss_token: token,
            token_type: 'Bearer',
            sucess: true,
            data: {
                user: user
            }
        })

    } catch (error) {
        res.status(400).json({ error: (error as Error).message });
    }
};

export const me = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        if (!user) return res.status(401).json({ error: 'Unauthorized' });
        res.json(user);
    } catch (error) {
        res.status(400).json({ error: (error as Error).message });
    }
};
