import { User } from '../domain/user.entity'; // UserEntity es una interface
import {UserDocument} from '../infrastructure/db/user.model';

export function toUserEntity(userModel: UserDocument): User {
  return {
    id: userModel._id?.toString() ?? userModel.id,
    email: userModel.email,
    name: userModel.name,
    phone: userModel.phone,
    role: userModel.role,
    companyId: userModel.companyId,
    areaId: userModel.areaId,
    isActive: userModel.isActive,
    password: userModel.password,
    createdAt: userModel.createdAt,
    updatedAt: userModel.updatedAt,
  };
}