import { Part } from '../entities';

export interface IPartRepository {
  findById(id: string): Promise<Part | null>;
  findBySkuCode(skuCode: string): Promise<Part | null>;
  findByBrandId(brandId: string): Promise<Part[]>;
  findByType(type: string): Promise<Part[]>;
  findAll(filter?: {
    brandId?: string;
    type?: string;
    search?: string;
  }): Promise<Part[]>;
  create(part: Part): Promise<Part>;
  update(part: Part): Promise<Part>;
  delete(id: string): Promise<void>;
}
