// src/infrastructure/web/auth.controller.ts

import { Request, Response } from 'express';
// import { signToken } from '../../shared/jwt';
import UserModel from '../db/user.model';
import bcrypt from 'bcryptjs';
import authConfig from '../../config/env/auth';
import moment from 'moment-timezone';
import appConfig from '../../config/env/server';
import { generateUniqueTokenId } from '../../shared/helper';
import { OAuthAccessTokenModel } from '../db/oauth-access-token.model';
import { JwtTokenService } from '../../shared/jwt-token.service';
// import { User } from '../../domain/user.entity';
import { toUserEntity } from '../../shared/user-mapper';




export const register = async (req: Request, res: Response) => {
    try {
        const { email, name, password, phone, role, companyId, areaId } = req.body;
        const existing = await UserModel.findOne({ email });
        if (existing) return res.status(400).json({ error: 'Email already exists' });

        // Validar formato de teléfono
        if (!phone || !/^\+\d{1,4}\d{6,15}$/.test(phone)) {
            return res.status(400).json({ error: 'El teléfono debe incluir código de país (ej: +51987654321)' });
        }

        const hashed = await bcrypt.hash(password, 10);
        const user = await UserModel.create({ email, name, password: hashed, phone, role, companyId, areaId, isActive: true });
        res.status(201).json({ id: user._id, email: user.email, name: user.name, phone: user.phone, role: user.role });
    } catch (error) {
        res.status(400).json({ error: (error as Error).message });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { username, password } = req.body;
        const user = await UserModel.findOne({ email: username });
        if (!user || !user.isActive) return res.status(401).json({ error: 'Invalid credentials' });
        const currentUserPassword = '$2b$' + user.password.substring(4);
        const isMatch = await bcrypt.compare(password, currentUserPassword);
        if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

        let token = await JwtTokenService.buildTokenPayload(toUserEntity(user));

        // Crear una copia del usuario sin la contraseña
        const userWithoutPassword = user.toObject();
        // @ts-ignore - Eliminar la contraseña por seguridad
        delete userWithoutPassword.password;

        res.json({
            access_token: token,
            // token_type: 'Bearer',
            sucess: true,
            data: {
                user: userWithoutPassword
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

// Nuevo endpoint para autenticación por teléfono (para MCP)
export const phoneLogin = async (req: Request, res: Response) => {
    try {
        const { phone } = req.body;
        
        if (!phone) {
            return res.status(400).json({ 
                success: false, 
                error: 'Número de teléfono requerido' 
            });
        }

        // Buscar usuario por teléfono
        const user = await UserModel.findOne({ phone, isActive: true });
        
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                error: 'Usuario no encontrado con este número de teléfono' 
            });
        }

        // Generar token JWT
        const token = await JwtTokenService.buildTokenPayload(toUserEntity(user));

        // Preparar respuesta sin contraseña
        const userWithoutPassword = user.toObject();
        const { password, ...userResponse } = userWithoutPassword;

        res.json({
            success: true,
            message: 'Autenticación exitosa',
            data: {
                token,
                user: userResponse,
                expiresIn: '24h'
            }
        });

    } catch (error) {
        console.error('Error in phoneLogin:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Error interno del servidor' 
        });
    }
};
