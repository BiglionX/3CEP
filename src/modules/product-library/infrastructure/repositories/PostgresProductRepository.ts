import { supabase } from '@/lib/supabase';
import { CompleteProduct, ProductStatus } from '../../domain/entities';
import { IProductRepository } from '../../domain/repositories';

export class PostgresProductRepository implements IProductRepository {
  private readonly tableName = 'product_library.complete_products';

  async findById(id: string): Promise<CompleteProduct | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;

    return this.mapToEntity(data);
  }

  async findBySkuCode(skuCode: string): Promise<CompleteProduct | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('sku_code', skuCode)
      .single();

    if (error || !data) return null;

    return this.mapToEntity(data);
  }

  async findByBrandId(
    brandId: string,
    filter?: { status?: ProductStatus }
  ): Promise<CompleteProduct[]> {
    let query = supabase
      .from(this.tableName)
      .select('*')
      .eq('brand_id', brandId);

    if (filter?.status) {
      query = query.eq('status', filter.status);
    }

    const { data, error } = await query.order('created_at', {
      ascending: false,
    });

    if (error || !data) return [];

    return data.map((item: any) => this.mapToEntity(item));
  }

  async findByCategoryId(categoryId: string): Promise<CompleteProduct[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('category_id', categoryId)
      .order('created_at', { ascending: false });

    if (error || !data) return [];

    return data.map((item: any) => this.mapToEntity(item));
  }

  async findAll(filter?: {
    brandId?: string;
    categoryId?: string;
    status?: ProductStatus;
    dataSource?: string;
    search?: string;
  }): Promise<CompleteProduct[]> {
    let query = supabase.from(this.tableName).select('*');

    if (filter?.brandId) {
      query = query.eq('brand_id', filter.brandId);
    }

    if (filter?.categoryId) {
      query = query.eq('category_id', filter.categoryId);
    }

    if (filter?.status) {
      query = query.eq('status', filter.status);
    }

    if (filter?.dataSource) {
      query = query.eq('data_source', filter.dataSource);
    }

    if (filter?.search) {
      // 使用全文搜索（如果配置了 tsvector）
      query = query.textSearch('search_vector', filter.search, {
        type: 'plain',
        config: 'simple',
      });
    }

    const { data, error } = await query.order('created_at', {
      ascending: false,
    });

    if (error || !data) return [];

    return data.map((item: any) => this.mapToEntity(item));
  }

  async create(product: CompleteProduct): Promise<CompleteProduct> {
    const { data, error } = await supabase
      .from(this.tableName)
      .insert([this.mapToRecord(product)])
      .select()
      .single();

    if (error) {
      throw new Error(`创建产品失败: ${error.message}`);
    }

    return this.mapToEntity(data);
  }

  async update(product: CompleteProduct): Promise<CompleteProduct> {
    const { data, error } = await supabase
      .from(this.tableName)
      .update(this.mapToRecord(product))
      .eq('id', product.id)
      .select()
      .single();

    if (error) {
      throw new Error(`更新产品失败: ${error.message}`);
    }

    return this.mapToEntity(data);
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from(this.tableName).delete().eq('id', id);

    if (error) {
      throw new Error(`删除产品失败: ${error.message}`);
    }
  }

  private mapToEntity(record: any): CompleteProduct {
    return new CompleteProduct({
      id: record.id,
      skuCode: record.sku_code,
      brandId: record.brand_id,
      categoryId: record.category_id,
      name: record.name,
      description: record.description,
      specifications: record.specifications || {},
      images: record.images || [],
      status: record.status,
      dataSource: record.data_source,
      sourceReference: record.source_reference,
      version: record.version,
      createdAt: new Date(record.created_at),
      updatedAt: new Date(record.updated_at),
    });
  }

  private mapToRecord(product: CompleteProduct): any {
    return {
      id: product.id,
      sku_code: product.skuCode,
      brand_id: product.brandId,
      category_id: product.categoryId,
      name: product.name,
      description: product.description,
      specifications: product.specifications,
      images: product.images,
      status: product.status,
      data_source: product.dataSource,
      source_reference: product.sourceReference,
      version: product.version,
      updated_at: product.updatedAt.toISOString(),
    };
  }
}
