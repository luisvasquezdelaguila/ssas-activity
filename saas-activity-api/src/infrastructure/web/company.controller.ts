// src/infrastructure/web/company.controller.ts

import { Request, Response } from 'express';
import { CompanyUseCase } from '../../application/company.usecase';
import { CompanyRepository } from '../repositories/company.repository';

const companyUseCase = new CompanyUseCase(new CompanyRepository());

export const createCompany = async (req: Request, res: Response) => {
  try {
    const company = await companyUseCase.createCompany(req.body);
    res.status(201).json(company);
  } catch (error) {
    const err = error as Error;
    res.status(400).json({ error: err.message });
  }
};

export const getCompanyById = async (req: Request, res: Response) => {
  try {
    const company = await companyUseCase.getCompanyById(req.params.id);
    if (!company) return res.status(404).json({ error: 'Company not found' });
    res.json(company);
  } catch (error) {
    const err = error as Error;
    res.status(400).json({ error: err.message });
  }
};

export const getAllCompanies = async (_req: Request, res: Response) => {
  try {
    const companies = await companyUseCase.getAllCompanies();
    res.json(companies);
  } catch (error) {
    const err = error as Error;
    res.status(400).json({ error: err.message });
  }
};

export const updateCompany = async (req: Request, res: Response) => {
  try {
    const company = await companyUseCase.updateCompany(req.params.id, req.body);
    if (!company) return res.status(404).json({ error: 'Company not found' });
    res.json(company);
  } catch (error) {
    const err = error as Error;
    res.status(400).json({ error: err.message });
  }
};

export const deleteCompany = async (req: Request, res: Response) => {
  try {
    const success = await companyUseCase.deleteCompany(req.params.id);
    if (!success) return res.status(404).json({ error: 'Company not found' });
    res.status(204).send();
  } catch (error) {
    const err = error as Error;
    res.status(400).json({ error: err.message });
  }
};
