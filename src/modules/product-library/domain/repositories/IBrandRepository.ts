import { Brand } from '../entities';

export interface IBrandRepository {
  findById(id: string): Promise<Brand | null>;
  findBySlug(slug: string): Promise<Brand | null>;
  findByApiKey(apiKey: string): Promise<Brand | null>;
  findAll(filter?: { isActive?: boolean; search?: string }): Promise<Brand[]>;
  create(brand: Brand): Promise<Brand>;
  update(brand: Brand): Promise<Brand>;
  delete(id: string): Promise<void>;
}
