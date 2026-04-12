import { supabase } from '@/lib/supabase';
import { Part } from '../../domain/entities';
import { IPartRepository } from '../../domain/repositories';

export class PostgresPartRepository implements IPartRepository {
  private readonly tableName = 'product_library.parts';

  async findById(id: string): Promise<Part | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;

    return this.mapToEntity(data);
  }

  async findBySkuCode(skuCode: string): Promise<Part | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('sku_code', skuCode)
      .single();

    if (error || !data) return null;

    return this.mapToEntity(data);
  }

  async findByBrandId(brandId: string): Promise<Part[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('brand_id', brandId)
      .order('created_at', { ascending: false });

    if (error || !data) return [];

    return data.map((item: any) => this.mapToEntity(item));
  }

  async findByType(type: string): Promise<Part[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('type', type)
      .order('created_at', { ascending: false });

    if (error || !data) return [];

    return data.map((item: any) => this.mapToEntity(item));
  }

  async findAll(filter?: {
    brandId?: string;
    type?: string;
    search?: string;
  }): Promise<Part[]> {
    let query = supabase.from(this.tableName).select('*');

    if (filter?.brandId) {
      query = query.eq('brand_id', filter.brandId);
    }

    if (filter?.type) {
      query = query.eq('type', filter.type);
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

  async create(part: Part): Promise<Part> {
    const { data, error } = await supabase
      .from(this.tableName)
      .insert([this.mapToRecord(part)])
      .select()
      .single();

    if (error) {
      throw new Error(`创建零件失败: ${error.message}`);
    }

    return this.mapToEntity(data);
  }

  async update(part: Part): Promise<Part> {
    const { data, error } = await supabase
      .from(this.tableName)
      .update(this.mapToRecord(part))
      .eq('id', part.id)
      .select()
      .single();

    if (error) {
      throw new Error(`更新零件失败: ${error.message}`);
    }

    return this.mapToEntity(data);
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from(this.tableName).delete().eq('id', id);

    if (error) {
      throw new Error(`删除零件失败: ${error.message}`);
    }
  }

  private mapToEntity(record: any): Part {
    return new Part({
      id: record.id,
      skuCode: record.sku_code,
      brandId: record.brand_id,
      name: record.name,
      type: record.type,
      description: record.description,
      specifications: record.specifications || {},
      material: record.material,
      dimensions: record.dimensions,
      createdAt: new Date(record.created_at),
    });
  }

  private mapToRecord(part: Part): any {
    return {
      id: part.id,
      sku_code: part.skuCode,
      brand_id: part.brandId,
      name: part.name,
      type: part.type,
      description: part.description,
      specifications: part.specifications,
      material: part.material,
      dimensions: part.dimensions,
    };
  }
}
