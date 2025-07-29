// src/infrastructure/web/auth.controller.ts

import { Request, Response } from 'express';
import UserModel from '../db/user.model';
import bcrypt from 'bcryptjs';
import { JwtTokenService } from '../../shared/jwt-token.service';
import { toUserEntity } from '../../shared/user-mapper';
import { loginSchema, registerSchema, phoneLoginSchema } from '../../shared/validators/auth.validator';




export const register = async (req: Request, res: Response) => {
    try {
        // Validar los datos de entrada con Zod
        const validatedData = registerSchema.parse(req.body);
        const { email, name, password, phone, role, companyId, areaId } = validatedData;
        
        const existing = await UserModel.findOne({ email });
        if (existing) {
            return res.status(400).json({ 
                success: false,
                error: 'Email already exists' 
            });
        }

        const hashed = await bcrypt.hash(password, 10);
        const user = await UserModel.create({ 
            email, 
            name, 
            password: hashed, 
            phone, 
            role, 
            companyId, 
            areaId, 
            isActive: true 
        });
        
        res.status(201).json({ 
            success: true,
            data: {
                id: user._id, 
                email: user.email, 
                name: user.name, 
                phone: user.phone, 
                role: user.role 
            }
        });
    } catch (error) {
        // Si es un error de validación de Zod
        if (error instanceof Error && error.name === 'ZodError') {
            return res.status(400).json({ 
                success: false,
                error: 'Datos de entrada inválidos',
                details: JSON.parse(error.message)
            });
        }
        
        res.status(400).json({ 
            success: false,
            error: (error as Error).message 
        });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        // Validar los datos de entrada con Zod
        const validatedData = loginSchema.parse(req.body);
        const { username, password } = validatedData;
        
        const user = await UserModel.findOne({ email: username });
        if (!user || !user.isActive) {
            return res.status(404).json({
                error: 'User not found or inactive',
                success: false
            });
        }
        
        const currentUserPassword = '$2b$' + user.password.substring(4);
        const isMatch = await bcrypt.compare(password, currentUserPassword);
        if (!isMatch) {
            return res.status(401).json({
                error: 'Invalid credentials',
                success: false
            });
        }

        let token = await JwtTokenService.buildTokenPayload(toUserEntity(user));

        // Crear una copia del usuario sin la contraseña
        const userWithoutPassword = user.toObject();
        // @ts-ignore - Eliminar la contraseña por seguridad
        delete userWithoutPassword.password;

        res.json({
            access_token: token,
            success: true,
            data: {
                user: userWithoutPassword
            }
        });

    } catch (error) {
        // Si es un error de validación de Zod
        if (error instanceof Error && error.name === 'ZodError') {
            return res.status(400).json({ 
                success: false,
                error: 'Datos de entrada inválidos',
                details: JSON.parse(error.message)
            });
        }
        
        res.status(400).json({
            error: (error as Error).message,
            success: false
        });
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
        // Validar los datos de entrada con Zod
        const validatedData = phoneLoginSchema.parse(req.body);
        const { phone } = validatedData;

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
        // Si es un error de validación de Zod
        if (error instanceof Error && error.name === 'ZodError') {
            return res.status(400).json({ 
                success: false,
                error: 'Datos de entrada inválidos',
                details: JSON.parse(error.message)
            });
        }
        
        console.error('Error in phoneLogin:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
};
