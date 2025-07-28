// src/domain/user.repository.ts

import { User } from './user.entity';

export interface IUserRepository {
  create(user: User): Promise<User>;
  findById(id: string): Promise<User | null>;
  findAll(): Promise<User[]>;
  findByCompanyId(companyId: string): Promise<User[]>;
  findByIdAndCompanyId(id: string, companyId: string): Promise<User | null>;
  findByPhone(phone: string): Promise<User | null>;
  update(id: string, user: Partial<User>): Promise<User | null>;
  delete(id: string): Promise<boolean>;
}
