import { Brand } from '../../domain/entities';
import { IBrandRepository } from '../../domain/repositories';

export interface CreateBrandInput {
  name: string;
  logoUrl?: string;
  websiteUrl?: string;
  contactEmail?: string;
}

export class CreateBrandUseCase {
  constructor(private brandRepository: IBrandRepository) {}

  async execute(input: CreateBrandInput): Promise<Brand> {
    // 1. 检查品牌名称是否已存在（通过 slug）
    const slug = input.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const existingBrand = await this.brandRepository.findBySlug(slug);
    if (existingBrand) {
      throw new Error(`品牌 "${input.name}" 已存在`);
    }

    // 2. 创建品牌实体
    const brand = new Brand({
      ...input,
      isActive: true,
    });

    // 3. 保存到数据库
    const savedBrand = await this.brandRepository.create(brand);

    return savedBrand;
  }
}
