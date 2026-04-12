export type RelationType =
  | 'includes'
  | 'compatible'
  | 'accessory'
  | 'component_of'
  | 'part_of';

export interface ProductRelationProps {
  id?: string;
  parentProductId: string;
  childProductId: string;
  relationType: RelationType;
  quantity?: number;
  createdAt?: Date;
}

export class ProductRelation {
  public readonly id: string;
  public parentProductId: string;
  public childProductId: string;
  public relationType: RelationType;
  public quantity: number;
  public readonly createdAt: Date;

  constructor(props: ProductRelationProps) {
    this.id = props.id || crypto.randomUUID();
    this.parentProductId = props.parentProductId;
    this.childProductId = props.childProductId;
    this.relationType = props.relationType;
    this.quantity = props.quantity || 1;
    this.createdAt = props.createdAt || new Date();
  }

  public updateQuantity(quantity: number): void {
    if (quantity < 1) {
      throw new Error('Quantity must be at least 1');
    }
    this.quantity = quantity;
  }

  public isBOMRelation(): boolean {
    return (
      this.relationType === 'includes' ||
      this.relationType === 'component_of' ||
      this.relationType === 'part_of'
    );
  }
}
