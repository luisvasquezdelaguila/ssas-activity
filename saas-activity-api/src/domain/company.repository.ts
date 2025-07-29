// src/domain/company.repository.ts

import { Company } from './company.entity';

export interface ICompanyRepository {
  create(company: Company): Promise<Company>;
  findById(id: string): Promise<Company | null>;
  findAll(): Promise<Company[]>;
  update(id: string, company: Partial<Company>): Promise<Company | null>;
  delete(id: string): Promise<boolean>;
}
