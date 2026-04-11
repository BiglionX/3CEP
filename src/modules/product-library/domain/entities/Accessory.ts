export interface AccessoryProps {
  id?: string;
  skuCode: string;
  brandId: string;
  name: string;
  description?: string;
  compatibleProducts?: string[];
  specifications?: Record<string, any>;
  createdAt?: Date;
}

export class Accessory {
  public readonly id: string;
  public skuCode: string;
  public brandId: string;
  public name: string;
  public description?: string;
  public compatibleProducts: string[];
  public specifications: Record<string, any>;
  public readonly createdAt: Date;

  constructor(props: AccessoryProps) {
    this.id = props.id || crypto.randomUUID();
    this.skuCode = props.skuCode;
    this.brandId = props.brandId;
    this.name = props.name;
    this.description = props.description;
    this.compatibleProducts = props.compatibleProducts || [];
    this.specifications = props.specifications || {};
    this.createdAt = props.createdAt || new Date();
  }

  public addCompatibleProduct(productId: string): void {
    if (!this.compatibleProducts.includes(productId)) {
      this.compatibleProducts.push(productId);
    }
  }

  public removeCompatibleProduct(productId: string): void {
    this.compatibleProducts = this.compatibleProducts.filter(
      id => id !== productId
    );
  }

  public updateSpecifications(specs: Record<string, any>): void {
    this.specifications = { ...this.specifications, ...specs };
  }
}
