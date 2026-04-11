import { supabase } from '@/lib/supabase';
import { Accessory } from '../../domain/entities';
import { IAccessoryRepository } from '../../domain/repositories';

export class PostgresAccessoryRepository implements IAccessoryRepository {
  private readonly tableName = 'product_library.accessories';

  async findById(id: string): Promise<Accessory | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;

    return this.mapToEntity(data);
  }

  async findBySkuCode(skuCode: string): Promise<Accessory | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('sku_code', skuCode)
      .single();

    if (error || !data) return null;

    return this.mapToEntity(data);
  }

  async findByBrandId(brandId: string): Promise<Accessory[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('brand_id', brandId)
      .order('created_at', { ascending: false });

    if (error || !data) return [];

    return data.map((item: any) => this.mapToEntity(item));
  }

  async findByCompatibleProduct(productId: string): Promise<Accessory[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .contains('compatible_products', [productId])
      .order('created_at', { ascending: false });

    if (error || !data) return [];

    return data.map((item: any) => this.mapToEntity(item));
  }

  async findAll(filter?: {
    brandId?: string;
    search?: string;
  }): Promise<Accessory[]> {
    let query = supabase.from(this.tableName).select('*');

    if (filter?.brandId) {
      query = query.eq('brand_id', filter.brandId);
    }

    if (filter?.search) {
      query = query.ilike('name', `%${filter.search}%`);
    }

    const { data, error } = await query.order('created_at', {
      ascending: false,
    });

    if (error || !data) return [];

    return data.map((item: any) => this.mapToEntity(item));
  }

  async create(accessory: Accessory): Promise<Accessory> {
    const { data, error } = await supabase
      .from(this.tableName)
      .insert([this.mapToRecord(accessory)])
      .select()
      .single();

    if (error) {
      throw new Error(`创建配件失败: ${error.message}`);
    }

    return this.mapToEntity(data);
  }

  async update(accessory: Accessory): Promise<Accessory> {
    const { data, error } = await supabase
      .from(this.tableName)
      .update(this.mapToRecord(accessory))
      .eq('id', accessory.id)
      .select()
      .single();

    if (error) {
      throw new Error(`更新配件失败: ${error.message}`);
    }

    return this.mapToEntity(data);
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from(this.tableName).delete().eq('id', id);

    if (error) {
      throw new Error(`删除配件失败: ${error.message}`);
    }
  }

  private mapToEntity(record: any): Accessory {
    return new Accessory({
      id: record.id,
      skuCode: record.sku_code,
      brandId: record.brand_id,
      name: record.name,
      description: record.description,
      compatibleProducts: record.compatible_products || [],
      specifications: record.specifications || {},
      createdAt: new Date(record.created_at),
    });
  }

  private mapToRecord(accessory: Accessory): any {
    return {
      id: accessory.id,
      sku_code: accessory.skuCode,
      brand_id: accessory.brandId,
      name: accessory.name,
      description: accessory.description,
      compatible_products: accessory.compatibleProducts,
      specifications: accessory.specifications,
    };
  }
}
