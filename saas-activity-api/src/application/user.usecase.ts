// src/application/user.usecase.ts

import { IUserRepository } from '../domain/user.repository';
import { User } from '../domain/user.entity';

export class UserUseCase {
  constructor(private userRepo: IUserRepository) {}

  async createUser(data: User): Promise<User> {
    return this.userRepo.create(data);
  }

  async getUserById(id: string): Promise<User | null> {
    return this.userRepo.findById(id);
  }

  async getAllUsers(): Promise<User[]> {
    return this.userRepo.findAll();
  }

  async updateUser(id: string, data: Partial<User>): Promise<User | null> {
    return this.userRepo.update(id, data);
  }

  async deleteUser(id: string): Promise<boolean> {
    return this.userRepo.delete(id);
  }
}
