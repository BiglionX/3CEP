import { supabase } from '@/lib/supabase';
import { ProductRelation, RelationType } from '../../domain/entities';
import { IProductRelationRepository } from '../../domain/repositories';

export class PostgresProductRelationRepository implements IProductRelationRepository {
  private readonly tableName = 'product_library.product_relations';

  async findById(id: string): Promise<ProductRelation | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;

    return this.mapToEntity(data);
  }

  async findByParentId(
    parentId: string,
    relationType?: RelationType
  ): Promise<ProductRelation[]> {
    let query = supabase
      .from(this.tableName)
      .select('*')
      .eq('parent_product_id', parentId);

    if (relationType) {
      query = query.eq('relation_type', relationType);
    }

    const { data, error } = await query.order('created_at', {
      ascending: false,
    });

    if (error || !data) return [];

    return data.map((item: any) => this.mapToEntity(item));
  }

  async findByChildId(childId: string): Promise<ProductRelation[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('child_product_id', childId)
      .order('created_at', { ascending: false });

    if (error || !data) return [];

    return data.map((item: any) => this.mapToEntity(item));
  }

  async findBOM(productId: string): Promise<ProductRelation[]> {
    // BOM关系包括：includes, component_of, part_of
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('parent_product_id', productId)
      .in('relation_type', ['includes', 'component_of', 'part_of'])
      .order('created_at', { ascending: false });

    if (error || !data) return [];

    return data.map((item: any) => this.mapToEntity(item));
  }

  async create(relation: ProductRelation): Promise<ProductRelation> {
    const { data, error } = await supabase
      .from(this.tableName)
      .insert([this.mapToRecord(relation)])
      .select()
      .single();

    if (error) {
      throw new Error(`创建产品关系失败: ${error.message}`);
    }

    return this.mapToEntity(data);
  }

  async update(relation: ProductRelation): Promise<ProductRelation> {
    const { data, error } = await supabase
      .from(this.tableName)
      .update(this.mapToRecord(relation))
      .eq('id', relation.id)
      .select()
      .single();

    if (error) {
      throw new Error(`更新产品关系失败: ${error.message}`);
    }

    return this.mapToEntity(data);
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from(this.tableName).delete().eq('id', id);

    if (error) {
      throw new Error(`删除产品关系失败: ${error.message}`);
    }
  }

  async deleteByParentAndChild(
    parentId: string,
    childId: string
  ): Promise<void> {
    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq('parent_product_id', parentId)
      .eq('child_product_id', childId);

    if (error) {
      throw new Error(`删除产品关系失败: ${error.message}`);
    }
  }

  private mapToEntity(record: any): ProductRelation {
    return new ProductRelation({
      id: record.id,
      parentProductId: record.parent_product_id,
      childProductId: record.child_product_id,
      relationType: record.relation_type,
      quantity: record.quantity,
      createdAt: new Date(record.created_at),
    });
  }

  private mapToRecord(relation: ProductRelation): any {
    return {
      id: relation.id,
      parent_product_id: relation.parentProductId,
      child_product_id: relation.childProductId,
      relation_type: relation.relationType,
      quantity: relation.quantity,
    };
  }
}
