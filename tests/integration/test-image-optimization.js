/**
 * 图片优化功能测试脚本
 * 验证图片压缩、格式转换和响应式优化效果
 */

const { imageOptimizer } = require('../../src/lib/image-optimizer');
const { imageService } = require('../../src/config/image-optimization.config');

async function testImageOptimization() {
  console.log('🚀 开始测试图片优化功能...\n');

  // 测试1: 图片分析功能
  console.log('📋 测试1: 图片分析功能');
  await testImageAnalysis();
  console.log('✅ 图片分析测试完成\n');

  // 测试2: 单张图片压缩
  console.log('📋 测试2: 单张图片压缩');
  await testSingleImageCompression();
  console.log('✅ 单张图片压缩测试完成\n');

  // 测试3: 批量图片压缩
  console.log('📋 测试3: 批量图片压缩');
  await testBatchCompression();
  console.log('✅ 批量图片压缩测试完成\n');

  // 测试4: 格式转换
  console.log('📋 测试4: 格式转换功能');
  await testFormatConversion();
  console.log('✅ 格式转换测试完成\n');

  // 测试5: 响应式图片生成
  console.log('📋 测试5: 响应式图片生成');
  await testResponsiveImages();
  console.log('✅ 响应式图片生成测试完成\n');

  // 测试6: 优化统计
  console.log('📋 测试6: 优化统计功能');
  await testOptimizationStats();
  console.log('✅ 优化统计测试完成\n');

  console.log('🎉 所有图片优化测试完成！');
}

async function testImageAnalysis() {
  console.log('  • 测试图片分析功能');

  try {
    const imagePath = './test-image.jpg';
    const analysis = await imageOptimizer.analyzeImage(imagePath);

    console.log(`    - 图片大小: ${(analysis.size / 1024).toFixed(2)}KB`);
    console.log(
      `    - 图片尺寸: ${analysis.dimensions.width}x${analysis.dimensions.height}`
    );
    console.log(`    - 图片格式: ${analysis.format}`);
    console.log(`    - MIME类型: ${analysis.mimeType}`);

    if (analysis.size > 0 && analysis.dimensions.width > 0) {
      console.log('    ✅ 图片分析功能正常');
    } else {
      throw new Error('图片分析结果异常');
    }
  } catch (error) {
    console.log(`    ❌ 图片分析失败: ${error.message}`);
    throw error;
  }
}

async function testSingleImageCompression() {
  console.log('  • 测试单张图片压缩');

  try {
    const imagePath = './sample-photo.jpg';
    const result = await imageOptimizer.compressImage(imagePath, {
      quality: 80,
      format: 'webp',
    });

    console.log(`    - 原始大小: ${(result.originalSize / 1024).toFixed(2)}KB`);
    console.log(
      `    - 优化后大小: ${(result.optimizedSize / 1024).toFixed(2)}KB`
    );
    console.log(`    - 压缩率: ${result.compressionRatio}%`);
    console.log(`    - 目标格式: ${result.format}`);

    if (result.compressionRatio >= 20 && result.compressionRatio <= 80) {
      console.log('    ✅ 单张图片压缩功能正常');
    } else {
      throw new Error(`压缩率异常: ${result.compressionRatio}%`);
    }
  } catch (error) {
    console.log(`    ❌ 单张图片压缩失败: ${error.message}`);
    throw error;
  }
}

async function testBatchCompression() {
  console.log('  • 测试批量图片压缩');

  try {
    const imagePaths = [
      './photo1.jpg',
      './photo2.png',
      './photo3.jpeg',
      './graphic1.png',
    ];

    const results = await imageOptimizer.compressBatch(imagePaths, 2);

    console.log(`    - 处理图片数量: ${results.length}`);
    console.log(
      `    - 平均压缩率: ${Math.round(
        results.reduce((sum, r) => sum + r.compressionRatio, 0) / results.length
      )}%`
    );

    const totalOriginal = results.reduce((sum, r) => sum + r.originalSize, 0);
    const totalOptimized = results.reduce((sum, r) => sum + r.optimizedSize, 0);
    const spaceSaved = totalOriginal - totalOptimized;

    console.log(`    - 总节省空间: ${(spaceSaved / 1024).toFixed(2)}KB`);
    console.log(
      `    - 总体压缩率: ${Math.round((spaceSaved / totalOriginal) * 100)}%`
    );

    if (results.length === imagePaths.length) {
      console.log('    ✅ 批量图片压缩功能正常');
    } else {
      throw new Error('批量处理数量不匹配');
    }
  } catch (error) {
    console.log(`    ❌ 批量图片压缩失败: ${error.message}`);
    throw error;
  }
}

async function testFormatConversion() {
  console.log('  • 测试格式转换功能');

  try {
    const imagePath = './original-image.jpg';

    // 测试WebP转换
    const webpResult = await imageOptimizer.convertFormat(imagePath, 'webp');
    console.log(`    - WebP转换压缩率: ${webpResult.compressionRatio}%`);

    // 测试AVIF转换
    const avifResult = await imageOptimizer.convertFormat(imagePath, 'avif');
    console.log(`    - AVIF转换压缩率: ${avifResult.compressionRatio}%`);

    // 测试JPEG转换
    const jpegResult = await imageOptimizer.convertFormat(imagePath, 'jpeg');
    console.log(`    - JPEG转换压缩率: ${jpegResult.compressionRatio}%`);

    if (webpResult.compressionRatio > 0 && avifResult.compressionRatio > 0) {
      console.log('    ✅ 格式转换功能正常');
    } else {
      throw new Error('格式转换压缩率异常');
    }
  } catch (error) {
    console.log(`    ❌ 格式转换失败: ${error.message}`);
    throw error;
  }
}

async function testResponsiveImages() {
  console.log('  • 测试响应式图片生成');

  try {
    const imagePath = './responsive-image.jpg';
    const responsiveConfig =
      await imageOptimizer.generateResponsiveImages(imagePath);

    console.log(`    - 生成断点数量: ${responsiveConfig.breakpoints.length}`);
    console.log(`    - SrcSet长度: ${responsiveConfig.srcSet.length}`);
    console.log(
      `    - Sizes属性: ${responsiveConfig.sizes.substring(0, 50)}...`
    );

    if (responsiveConfig.breakpoints.length > 0) {
      console.log('    ✅ 响应式图片生成功能正常');
    } else {
      throw new Error('未生成响应式断点');
    }
  } catch (error) {
    console.log(`    ❌ 响应式图片生成失败: ${error.message}`);
    throw error;
  }
}

async function testOptimizationStats() {
  console.log('  • 测试优化统计功能');

  try {
    const stats = imageOptimizer.getOptimizationStats();

    console.log(`    - 总处理图片数: ${stats.totalImages}`);
    console.log(
      `    - 总原始大小: ${(stats.totalOriginalSize / 1024).toFixed(2)}KB`
    );
    console.log(
      `    - 总优化大小: ${(stats.totalOptimizedSize / 1024).toFixed(2)}KB`
    );
    console.log(`    - 平均压缩率: ${stats.averageCompressionRatio}%`);

    // 检查格式分布
    console.log(`    - 格式分布:`, stats.formatDistribution);

    if (stats.totalImages >= 0) {
      console.log('    ✅ 优化统计功能正常');
    } else {
      throw new Error('统计信息异常');
    }
  } catch (error) {
    console.log(`    ❌ 优化统计失败: ${error.message}`);
    throw error;
  }
}

// 执行测试
if (require.main === module) {
  testImageOptimization().catch(error => {
    console.error('测试执行失败:', error);
    process.exit(1);
  });
}

module.exports = { testImageOptimization };
