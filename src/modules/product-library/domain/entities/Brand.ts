export interface BrandProps {
  id?: string;
  name: string;
  slug?: string;
  logoUrl?: string;
  websiteUrl?: string;
  contactEmail?: string;
  apiKey?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Brand {
  public readonly id: string;
  public name: string;
  public slug: string;
  public logoUrl?: string;
  public websiteUrl?: string;
  public contactEmail?: string;
  public apiKey?: string;
  public isActive: boolean;
  public readonly createdAt: Date;
  public updatedAt: Date;

  constructor(props: BrandProps) {
    this.id = props.id || crypto.randomUUID();
    this.name = props.name;
    this.slug = props.slug || this.generateSlug(props.name);
    this.logoUrl = props.logoUrl;
    this.websiteUrl = props.websiteUrl;
    this.contactEmail = props.contactEmail;
    this.apiKey = props.apiKey;
    this.isActive = props.isActive ?? true;
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  public updateDetails(updates: Partial<BrandProps>): void {
    if (updates.name) {
      this.updateName(updates.name);
    }
    if (updates.logoUrl !== undefined) this.logoUrl = updates.logoUrl;
    if (updates.websiteUrl !== undefined) this.websiteUrl = updates.websiteUrl;
    if (updates.contactEmail !== undefined)
      this.contactEmail = updates.contactEmail;
    if (updates.isActive !== undefined) this.isActive = updates.isActive;
    this.updatedAt = new Date();
  }

  public updateName(name: string): void {
    this.name = name;
    this.slug = this.generateSlug(name);
  }
}
