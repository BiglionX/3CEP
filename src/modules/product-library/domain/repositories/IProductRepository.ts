import { CompleteProduct, DataSource, ProductStatus } from '../entities';

export interface IProductRepository {
  findById(id: string): Promise<CompleteProduct | null>;
  findBySkuCode(skuCode: string): Promise<CompleteProduct | null>;
  findByBrandId(
    brandId: string,
    filter?: { status?: ProductStatus }
  ): Promise<CompleteProduct[]>;
  findByCategoryId(categoryId: string): Promise<CompleteProduct[]>;
  findAll(filter?: {
    brandId?: string;
    categoryId?: string;
    status?: ProductStatus;
    dataSource?: DataSource;
    search?: string;
  }): Promise<CompleteProduct[]>;
  create(product: CompleteProduct): Promise<CompleteProduct>;
  update(product: CompleteProduct): Promise<CompleteProduct>;
  delete(id: string): Promise<void>;
}
