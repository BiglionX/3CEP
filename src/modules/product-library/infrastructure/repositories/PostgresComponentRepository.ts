import { supabase } from '@/lib/supabase';
import { Component } from '../../domain/entities';
import { IComponentRepository } from '../../domain/repositories';

export class PostgresComponentRepository implements IComponentRepository {
  private readonly tableName = 'product_library.components';

  async findById(id: string): Promise<Component | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;

    return this.mapToEntity(data);
  }

  async findBySkuCode(skuCode: string): Promise<Component | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('sku_code', skuCode)
      .single();

    if (error || !data) return null;

    return this.mapToEntity(data);
  }

  async findByBrandId(brandId: string): Promise<Component[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('brand_id', brandId)
      .order('created_at', { ascending: false });

    if (error || !data) return [];

    return data.map((item: any) => this.mapToEntity(item));
  }

  async findByType(type: string): Promise<Component[]> {
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
  }): Promise<Component[]> {
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

  async create(component: Component): Promise<Component> {
    const { data, error } = await supabase
      .from(this.tableName)
      .insert([this.mapToRecord(component)])
      .select()
      .single();

    if (error) {
      throw new Error(`创建部件失败: ${error.message}`);
    }

    return this.mapToEntity(data);
  }

  async update(component: Component): Promise<Component> {
    const { data, error } = await supabase
      .from(this.tableName)
      .update(this.mapToRecord(component))
      .eq('id', component.id)
      .select()
      .single();

    if (error) {
      throw new Error(`更新部件失败: ${error.message}`);
    }

    return this.mapToEntity(data);
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from(this.tableName).delete().eq('id', id);

    if (error) {
      throw new Error(`删除部件失败: ${error.message}`);
    }
  }

  private mapToEntity(record: any): Component {
    return new Component({
      id: record.id,
      skuCode: record.sku_code,
      brandId: record.brand_id,
      name: record.name,
      type: record.type,
      description: record.description,
      specifications: record.specifications || {},
      createdAt: new Date(record.created_at),
    });
  }

  private mapToRecord(component: Component): any {
    return {
      id: component.id,
      sku_code: component.skuCode,
      brand_id: component.brandId,
      name: component.name,
      type: component.type,
      description: component.description,
      specifications: component.specifications,
    };
  }
}
