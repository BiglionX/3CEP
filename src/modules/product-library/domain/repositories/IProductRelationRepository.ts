import { ProductRelation, RelationType } from '../entities';

export interface IProductRelationRepository {
  findById(id: string): Promise<ProductRelation | null>;
  findByParentId(
    parentId: string,
    relationType?: RelationType
  ): Promise<ProductRelation[]>;
  findByChildId(childId: string): Promise<ProductRelation[]>;
  findBOM(productId: string): Promise<ProductRelation[]>; // BOM关系查询
  create(relation: ProductRelation): Promise<ProductRelation>;
  update(relation: ProductRelation): Promise<ProductRelation>;
  delete(id: string): Promise<void>;
  deleteByParentAndChild(parentId: string, childId: string): Promise<void>;
}
