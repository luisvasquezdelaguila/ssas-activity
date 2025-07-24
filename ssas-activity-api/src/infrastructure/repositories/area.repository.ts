// src/infrastructure/repositories/area.repository.ts

import { IAreaRepository } from '../../domain/area.repository';
import { Area } from '../../domain/area.entity';
import AreaModel from '../db/area.model';

function toArea(doc: any): Area {
  const obj = doc.toObject();
  return {
    ...obj,
    id: obj._id.toString(),
    _id: undefined,
    __v: undefined,
  };
}

export class AreaRepository implements IAreaRepository {
  async create(area: Area): Promise<Area> {
    const created = await AreaModel.create(area);
    return toArea(created);
  }

  async findById(id: string): Promise<Area | null> {
    const found = await AreaModel.findById(id);
    return found ? toArea(found) : null;
  }

  async findAll(): Promise<Area[]> {
    const areas = await AreaModel.find();
    return areas.map((a: any) => toArea(a));
  }

  async update(id: string, area: Partial<Area>): Promise<Area | null> {
    const updated = await AreaModel.findByIdAndUpdate(id, area, { new: true });
    return updated ? toArea(updated) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await AreaModel.findByIdAndDelete(id);
    return !!result;
  }
}
