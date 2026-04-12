import { supabase } from '@/lib/supabase';
import { Brand } from '../../domain/entities';
import { IBrandRepository } from '../../domain/repositories';

export class PostgresBrandRepository implements IBrandRepository {
  private readonly tableName = 'product_library.brands';

  async findById(id: string): Promise<Brand | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;

    return this.mapToEntity(data);
  }

  async findBySlug(slug: string): Promise<Brand | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('slug', slug)
      .single();

    if (error || !data) return null;

    return this.mapToEntity(data);
  }

  async findByApiKey(apiKey: string): Promise<Brand | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('api_key', apiKey)
      .single();

    if (error || !data) return null;

    return this.mapToEntity(data);
  }

  async findAll(filter?: {
    isActive?: boolean;
    search?: string;
  }): Promise<Brand[]> {
    let query = supabase.from(this.tableName).select('*');

    if (filter?.isActive !== undefined) {
      query = query.eq('is_active', filter.isActive);
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

  async create(brand: Brand): Promise<Brand> {
    const { data, error } = await supabase
      .from(this.tableName)
      .insert([this.mapToRecord(brand)])
      .select()
      .single();

    if (error) {
      throw new Error(`创建品牌失败: ${error.message}`);
    }

    return this.mapToEntity(data);
  }

  async update(brand: Brand): Promise<Brand> {
    const { data, error } = await supabase
      .from(this.tableName)
      .update(this.mapToRecord(brand))
      .eq('id', brand.id)
      .select()
      .single();

    if (error) {
      throw new Error(`更新品牌失败: ${error.message}`);
    }

    return this.mapToEntity(data);
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from(this.tableName).delete().eq('id', id);

    if (error) {
      throw new Error(`删除品牌失败: ${error.message}`);
    }
  }

  private mapToEntity(record: any): Brand {
    return new Brand({
      id: record.id,
      name: record.name,
      slug: record.slug,
      logoUrl: record.logo_url,
      websiteUrl: record.website_url,
      contactEmail: record.contact_email,
      apiKey: record.api_key,
      isActive: record.is_active,
      createdAt: new Date(record.created_at),
      updatedAt: new Date(record.updated_at),
    });
  }

  private mapToRecord(brand: Brand): any {
    return {
      id: brand.id,
      name: brand.name,
      slug: brand.slug,
      logo_url: brand.logoUrl,
      website_url: brand.websiteUrl,
      contact_email: brand.contactEmail,
      api_key: brand.apiKey,
      is_active: brand.isActive,
      updated_at: brand.updatedAt.toISOString(),
    };
  }
}
