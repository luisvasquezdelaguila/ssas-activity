// src/infrastructure/repositories/company.repository.ts


import { ICompanyRepository } from '../../domain/company.repository';
import { Company } from '../../domain/company.entity';
import CompanyModel from '../db/company.model';

function toCompany(doc: any): Company {
  const obj = doc.toObject();
  return {
    ...obj,
    id: obj._id.toString(),
    _id: undefined,
    __v: undefined,
  };
}

export class CompanyRepository implements ICompanyRepository {
  async create(company: Company): Promise<Company> {
    const created = await CompanyModel.create(company);
    return toCompany(created);
  }

  async findById(id: string): Promise<Company | null> {
    const found = await CompanyModel.findById(id);
    return found ? toCompany(found) : null;
  }

  async findAll(): Promise<Company[]> {
    const companies = await CompanyModel.find();
    return companies.map((c: any) => toCompany(c));
  }

  async update(id: string, company: Partial<Company>): Promise<Company | null> {
    const updated = await CompanyModel.findByIdAndUpdate(id, company, { new: true });
    return updated ? toCompany(updated) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await CompanyModel.findByIdAndDelete(id);
    return !!result;
  }
}
