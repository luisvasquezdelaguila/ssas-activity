// src/infrastructure/repositories/user.repository.ts

import { IUserRepository } from '../../domain/user.repository';
import { User } from '../../domain/user.entity';
import UserModel from '../db/user.model';

function toUser(doc: any): User {
  const obj = doc.toObject();
  return {
    ...obj,
    id: obj._id.toString(),
    _id: undefined,
    __v: undefined,
  };
}

export class UserRepository implements IUserRepository {
  async create(user: User): Promise<User> {
    const created = await UserModel.create(user);
    return toUser(created);
  }

  async findById(id: string): Promise<User | null> {
    const found = await UserModel.findById(id);
    return found ? toUser(found) : null;
  }

  async findAll(): Promise<User[]> {
    const users = await UserModel.find();
    return users.map((u: any) => toUser(u));
  }

  async update(id: string, user: Partial<User>): Promise<User | null> {
    const updated = await UserModel.findByIdAndUpdate(id, user, { new: true });
    return updated ? toUser(updated) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await UserModel.findByIdAndDelete(id);
    return !!result;
  }
}
