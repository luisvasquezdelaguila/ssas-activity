// src/application/company.usecase.ts

import { ICompanyRepository } from '../domain/company.repository';
import { Company } from '../domain/company.entity';

export class CompanyUseCase {
  constructor(private companyRepo: ICompanyRepository) {}

  async createCompany(data: Company): Promise<Company> {
    return this.companyRepo.create(data);
  }

  async getCompanyById(id: string): Promise<Company | null> {
    return this.companyRepo.findById(id);
  }

  async getAllCompanies(): Promise<Company[]> {
    return this.companyRepo.findAll();
  }

  async updateCompany(id: string, data: Partial<Company>): Promise<Company | null> {
    return this.companyRepo.update(id, data);
  }

  async deleteCompany(id: string): Promise<boolean> {
    return this.companyRepo.delete(id);
  }
}
