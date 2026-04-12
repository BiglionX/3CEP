import {
  Accessory,
  CompleteProduct,
  Component,
  Part,
} from '../../domain/entities';
import {
  IAccessoryRepository,
  IComponentRepository,
  IPartRepository,
  IProductRepository,
} from '../../domain/repositories';

export type ProductType = 'complete' | 'accessory' | 'component' | 'part';

export interface SearchProductsInput {
  type?: ProductType;
  brandId?: string;
  categoryId?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface SearchProductsResult {
  products: (CompleteProduct | Accessory | Component | Part)[];
  total: number;
  hasMore: boolean;
}

export class SearchProductsUseCase {
  constructor(
    private productRepository: IProductRepository,
    private accessoryRepository: IAccessoryRepository,
    private componentRepository: IComponentRepository,
    private partRepository: IPartRepository
  ) {}

  async execute(input: SearchProductsInput): Promise<SearchProductsResult> {
    const limit = input.limit || 50;
    const offset = input.offset || 0;
    let products: (CompleteProduct | Accessory | Component | Part)[] = [];
    let total = 0;

    // 根据类型搜索
    if (!input.type || input.type === 'complete') {
      const completeProducts = await this.productRepository.findAll({
        brandId: input.brandId,
        categoryId: input.categoryId,
        status: 'published',
        search: input.search,
      });

      if (!input.type) {
        products.push(...completeProducts);
        total += completeProducts.length;
      } else {
        products = completeProducts;
        total = completeProducts.length;
      }
    }

    if (!input.type || input.type === 'accessory') {
      const accessories = await this.accessoryRepository.findAll({
        brandId: input.brandId,
        search: input.search,
      });

      if (!input.type) {
        products.push(...accessories);
        total += accessories.length;
      } else {
        products = accessories;
        total = accessories.length;
      }
    }

    if (!input.type || input.type === 'component') {
      const components = await this.componentRepository.findAll({
        brandId: input.brandId,
        search: input.search,
      });

      if (!input.type) {
        products.push(...components);
        total += components.length;
      } else {
        products = components;
        total = components.length;
      }
    }

    if (!input.type || input.type === 'part') {
      const parts = await this.partRepository.findAll({
        brandId: input.brandId,
        search: input.search,
      });

      if (!input.type) {
        products.push(...parts);
        total += parts.length;
      } else {
        products = parts;
        total = parts.length;
      }
    }

    // 分页
    const paginatedProducts = products.slice(offset, offset + limit);
    const hasMore = offset + limit < total;

    return {
      products: paginatedProducts,
      total,
      hasMore,
    };
  }
}
