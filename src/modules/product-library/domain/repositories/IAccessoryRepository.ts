import { Accessory } from '../entities';

export interface IAccessoryRepository {
  findById(id: string): Promise<Accessory | null>;
  findBySkuCode(skuCode: string): Promise<Accessory | null>;
  findByBrandId(brandId: string): Promise<Accessory[]>;
  findByCompatibleProduct(productId: string): Promise<Accessory[]>;
  findAll(filter?: { brandId?: string; search?: string }): Promise<Accessory[]>;
  create(accessory: Accessory): Promise<Accessory>;
  update(accessory: Accessory): Promise<Accessory>;
  delete(id: string): Promise<void>;
}
