export type ProductStatus = 'draft' | 'published' | 'deprecated';
export type DataSource = 'official' | 'imported' | 'user_contributed';

export interface CompleteProductProps {
  id?: string;
  skuCode: string;
  brandId: string;
  categoryId?: string;
  name: string;
  description?: string;
  specifications?: Record<string, any>;
  images?: string[];
  status?: ProductStatus;
  dataSource?: DataSource;
  sourceReference?: string;
  version?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class CompleteProduct {
  public readonly id: string;
  public skuCode: string;
  public brandId: string;
  public categoryId?: string;
  public name: string;
  public description?: string;
  public specifications: Record<string, any>;
  public images: string[];
  public status: ProductStatus;
  public dataSource: DataSource;
  public sourceReference?: string;
  public version: number;
  public readonly createdAt: Date;
  public updatedAt: Date;

  constructor(props: CompleteProductProps) {
    this.id = props.id || crypto.randomUUID();
    this.skuCode = props.skuCode;
    this.brandId = props.brandId;
    this.categoryId = props.categoryId;
    this.name = props.name;
    this.description = props.description;
    this.specifications = props.specifications || {};
    this.images = props.images || [];
    this.status = props.status || 'draft';
    this.dataSource = props.dataSource || 'official';
    this.sourceReference = props.sourceReference;
    this.version = props.version || 1;
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
  }

  public updateDetails(updates: Partial<CompleteProductProps>): void {
    if (updates.name) this.name = updates.name;
    if (updates.description !== undefined)
      this.description = updates.description;
    if (updates.specifications)
      this.specifications = {
        ...this.specifications,
        ...updates.specifications,
      };
    if (updates.images) this.images = updates.images;
    if (updates.status) this.status = updates.status;
    if (updates.categoryId !== undefined) this.categoryId = updates.categoryId;
    this.updatedAt = new Date();
  }

  public publish(): void {
    this.status = 'published';
    this.updatedAt = new Date();
  }

  public deprecate(): void {
    this.status = 'deprecated';
    this.updatedAt = new Date();
  }

  public incrementVersion(): void {
    this.version += 1;
    this.updatedAt = new Date();
  }
}
