import { CompleteProduct } from '../../domain/entities';
import { IProductRepository } from '../../domain/repositories';
import { ProductValidationService } from '../../domain/services';

export interface CreateProductInput {
  skuCode: string;
  brandId: string;
  categoryId?: string;
  name: string;
  description?: string;
  specifications?: Record<string, any>;
  images?: string[];
}

export class CreateProductUseCase {
  constructor(
    private productRepository: IProductRepository,
    private validationService: ProductValidationService
  ) {}

  async execute(input: CreateProductInput): Promise<CompleteProduct> {
    // 1. 验证数据
    const validationResult = this.validationService.validateProductData(
      input,
      'complete'
    );

    if (!validationResult.isValid) {
      throw new Error(
        `产品数据验证失败: ${validationResult.errors.join(', ')}`
      );
    }

    // 2. 检查 SKU 是否已存在
    const existingProduct = await this.productRepository.findBySkuCode(
      input.skuCode
    );
    if (existingProduct) {
      throw new Error(`SKU编码 ${input.skuCode} 已存在`);
    }

    // 3. 创建产品实体
    const product = new CompleteProduct({
      ...input,
      status: 'draft',
      dataSource: 'official',
    });

    // 4. 保存到数据库
    const savedProduct = await this.productRepository.create(product);

    return savedProduct;
  }
}
