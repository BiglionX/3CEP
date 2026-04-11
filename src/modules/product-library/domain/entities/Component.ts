export interface ComponentProps {
  id?: string;
  skuCode: string;
  brandId: string;
  name: string;
  type?: string;
  description?: string;
  specifications?: Record<string, any>;
  createdAt?: Date;
}

export class Component {
  public readonly id: string;
  public skuCode: string;
  public brandId: string;
  public name: string;
  public type?: string;
  public description?: string;
  public specifications: Record<string, any>;
  public readonly createdAt: Date;

  constructor(props: ComponentProps) {
    this.id = props.id || crypto.randomUUID();
    this.skuCode = props.skuCode;
    this.brandId = props.brandId;
    this.name = props.name;
    this.type = props.type;
    this.description = props.description;
    this.specifications = props.specifications || {};
    this.createdAt = props.createdAt || new Date();
  }

  public updateType(type: string): void {
    this.type = type;
  }

  public updateSpecifications(specs: Record<string, any>): void {
    this.specifications = { ...this.specifications, ...specs };
  }
}
