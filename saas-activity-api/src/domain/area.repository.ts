// src/domain/area.repository.ts

import { Area } from './area.entity';

export interface IAreaRepository {
  create(area: Area): Promise<Area>;
  findById(id: string): Promise<Area | null>;
  findAll(): Promise<Area[]>;
  update(id: string, area: Partial<Area>): Promise<Area | null>;
  delete(id: string): Promise<boolean>;
}
