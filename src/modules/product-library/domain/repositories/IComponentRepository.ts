import { Component } from '../entities';

export interface IComponentRepository {
  findById(id: string): Promise<Component | null>;
  findBySkuCode(skuCode: string): Promise<Component | null>;
  findByBrandId(brandId: string): Promise<Component[]>;
  findByType(type: string): Promise<Component[]>;
  findAll(filter?: {
    brandId?: string;
    type?: string;
    search?: string;
  }): Promise<Component[]>;
  create(component: Component): Promise<Component>;
  update(component: Component): Promise<Component>;
  delete(id: string): Promise<void>;
}
