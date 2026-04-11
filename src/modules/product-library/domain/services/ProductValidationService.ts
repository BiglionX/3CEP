export interface ProductValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export class ProductValidationService {
  public validateProductData(
    data: Record<string, any>,
    productType: 'complete' | 'accessory' | 'component' | 'part'
  ): ProductValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 通用验证
    if (!data.name || data.name.trim() === '') {
      errors.push('产品名称不能为空');
    }

    if (!data.skuCode || data.skuCode.trim() === '') {
      errors.push('SKU编码不能为空');
    } else if (!this.validateSkuFormat(data.skuCode)) {
      errors.push('SKU编码格式不正确');
    }

    if (!data.brandId) {
      errors.push('品牌ID不能为空');
    }

    // 特定类型验证
    if (productType === 'complete') {
      if (!data.categoryId) {
        warnings.push('建议为整机产品指定类目');
      }
    }

    if (productType === 'part') {
      if (data.dimensions) {
        if (
          !data.dimensions.length ||
          !data.dimensions.width ||
          !data.dimensions.height
        ) {
          warnings.push('零件尺寸信息不完整');
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  private validateSkuFormat(sku: string): boolean {
    // SKU格式：字母数字组合，长度3-50
    const skuRegex = /^[A-Za-z0-9\-_]{3,50}$/;
    return skuRegex.test(sku);
  }

  public validateSpecifications(
    specs: Record<string, any>
  ): ProductValidationResult {
    const warnings: string[] = [];

    if (specs && typeof specs === 'object') {
      // 检查常见规格字段
      if (
        specs.weight &&
        (typeof specs.weight !== 'number' || specs.weight <= 0)
      ) {
        warnings.push('重量必须是正数');
      }

      if (specs.dimensions && typeof specs.dimensions === 'object') {
        const { length, width, height } = specs.dimensions;
        if (length && width && height) {
          if (length <= 0 || width <= 0 || height <= 0) {
            warnings.push('尺寸必须是正数');
          }
        }
      }
    }

    return {
      isValid: true,
      errors: [],
      warnings,
    };
  }
}
