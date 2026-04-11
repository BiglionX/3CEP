export interface PartProps {
  id?: string;
  skuCode: string;
  brandId?: string;
  name: string;
  type?: string;
  description?: string;
  specifications?: Record<string, any>;
  material?: string;
  dimensions?: {
    length: number;
    width: number;
    height: number;
    unit: 'mm' | 'cm' | 'in';
  };
  createdAt?: Date;
}

export class Part {
  public readonly id: string;
  public skuCode: string;
  public brandId?: string;
  public name: string;
  public type?: string;
  public description?: string;
  public specifications: Record<string, any>;
  public material?: string;
  public dimensions?: {
    length: number;
    width: number;
    height: number;
    unit: 'mm' | 'cm' | 'in';
  };
  public readonly createdAt: Date;

  constructor(props: PartProps) {
    this.id = props.id || crypto.randomUUID();
    this.skuCode = props.skuCode;
    this.brandId = props.brandId;
    this.name = props.name;
    this.type = props.type;
    this.description = props.description;
    this.specifications = props.specifications || {};
    this.material = props.material;
    this.dimensions = props.dimensions;
    this.createdAt = props.createdAt || new Date();
  }

  public updateDimensions(dimensions: PartProps['dimensions']): void {
    this.dimensions = dimensions;
  }

  public updateMaterial(material: string): void {
    this.material = material;
  }
}
