// src/application/area.usecase.ts

import { IAreaRepository } from '../domain/area.repository';
import { Area } from '../domain/area.entity';

export class AreaUseCase {
  constructor(private areaRepo: IAreaRepository) {}

  async createArea(data: Area): Promise<Area> {
    return this.areaRepo.create(data);
  }

  async getAreaById(id: string): Promise<Area | null> {
    return this.areaRepo.findById(id);
  }

  async getAllAreas(): Promise<Area[]> {
    return this.areaRepo.findAll();
  }

  async updateArea(id: string, data: Partial<Area>): Promise<Area | null> {
    return this.areaRepo.update(id, data);
  }

  async deleteArea(id: string): Promise<boolean> {
    return this.areaRepo.delete(id);
  }
}
