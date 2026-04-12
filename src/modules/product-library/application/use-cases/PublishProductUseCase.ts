import { CompleteProduct } from '../../domain/entities';
import { IProductRepository } from '../../domain/repositories';

export class PublishProductUseCase {
  constructor(private productRepository: IProductRepository) {}

  async execute(productId: string): Promise<CompleteProduct> {
    // 1. 查找产品
    const product = await this.productRepository.findById(productId);

    if (!product) {
      throw new Error('产品不存在');
    }

    // 2. 检查是否可以发布
    if (product.status === 'published') {
      throw new Error('产品已经发布');
    }

    // 3. 发布产品
    product.publish();

    // 4. 保存更新
    const updatedProduct = await this.productRepository.update(product);

    return updatedProduct;
  }
}
