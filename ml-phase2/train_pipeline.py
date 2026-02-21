"""
机器学习模型完整训练流水线
集成所有V-ML任务的端到端训练脚本
"""

import pandas as pd
import numpy as np
import logging
import argparse
from datetime import datetime
from config import Config
from utils.database import DatabaseManager
from preprocessing.data_processor import DataProcessor
from models.trainer import ModelTrainer
from features.market_enhancer import MarketFeatureEnhancer

# 配置日志
logging.basicConfig(
    level=getattr(logging, Config.LOG_LEVEL),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class MLTrainingPipeline:
    def __init__(self, use_market_features=True, tune_hyperparams=False):
        self.use_market_features = use_market_features
        self.tune_hyperparams = tune_hyperparams
        
        # 初始化组件
        self.db_manager = DatabaseManager()
        self.data_processor = DataProcessor()
        self.model_trainer = ModelTrainer()
        self.market_enhancer = MarketFeatureEnhancer() if use_market_features else None
        
        # 初始化路径
        Config.init_paths()
        
    def run_complete_pipeline(self):
        """运行完整的训练流水线"""
        logger.info("🚀 开始机器学习模型训练流水线")
        start_time = datetime.now()
        
        try:
            # V-ML-01: 数据采集
            logger.info("\n📋 V-ML-01: 内部成交数据采集")
            raw_data = self.collect_training_data()
            
            # V-ML-02: 数据清洗与特征工程
            logger.info("\n🧹 V-ML-02: 数据清洗与特征工程")
            if self.use_market_features:
                X, y, processed_data = self.market_enhancer.retrain_with_market_features(raw_data)
            else:
                X, y, processed_data = self.process_without_market_features(raw_data)
            
            # 保存处理后的数据
            self.save_processed_datasets(processed_data, X, y)
            
            # V-ML-03: 模型训练与调优
            logger.info("\n🤖 V-ML-03: 模型训练与调优")
            X_train, X_test, y_train, y_test = self.data_processor.split_data(X, y)
            results = self.model_trainer.train_complete_pipeline(
                X_train, y_train, X_test, y_test, 
                tune_hyperparams=self.tune_hyperparams
            )
            
            # V-ML-04: 模型部署准备
            logger.info("\n📦 V-ML-04: 模型部署准备")
            self.prepare_deployment_artifacts(X.columns.tolist())
            
            # 总结报告
            self.generate_training_report(results, start_time)
            
            logger.info("\n✅ 机器学习模型训练流水线完成!")
            return True
            
        except Exception as e:
            logger.error(f"❌ 训练流水线失败: {e}")
            raise
    
    def collect_training_data(self):
        """收集训练数据"""
        raw_data = self.db_manager.collect_training_data()
        logger.info(f"采集到 {len(raw_data)} 条原始训练记录")
        
        # 基础数据质量检查
        self.perform_data_quality_check(raw_data)
        
        return raw_data
    
    def process_without_market_features(self, raw_data):
        """不使用市场特征的数据处理"""
        X, y, processed_data = self.data_processor.process_complete_pipeline(raw_data)
        return X, y, processed_data
    
    def save_processed_datasets(self, processed_data, X, y):
        """保存处理后的数据集"""
        # 保存完整处理后的数据
        self.db_manager.save_processed_data(
            processed_data, 
            f'training_data_processed_{datetime.now().strftime("%Y%m%d_%H%M%S")}.csv'
        )
        
        # 保存特征和标签
        feature_df = X.copy()
        feature_df['target_price'] = y
        self.db_manager.save_processed_data(
            feature_df,
            f'features_and_labels_{datetime.now().strftime("%Y%m%d_%H%M%S")}.csv'
        )
        
        logger.info("处理后的数据集已保存")
    
    def prepare_deployment_artifacts(self, feature_columns):
        """准备部署所需的构件"""
        # 保存特征列信息
        feature_path = f"{Config.MODEL_SAVE_PATH}/feature_columns.txt"
        with open(feature_path, 'w') as f:
            for col in feature_columns:
                f.write(f"{col}\n")
        logger.info(f"特征列信息已保存: {feature_path}")
        
        # 保存模型元数据
        metadata = {
            'training_date': datetime.now().isoformat(),
            'feature_count': len(feature_columns),
            'features': feature_columns,
            'model_type': self.model_trainer.best_model_name,
            'uses_market_features': self.use_market_features
        }
        
        import json
        metadata_path = f"{Config.MODEL_SAVE_PATH}/model_metadata.json"
        with open(metadata_path, 'w') as f:
            json.dump(metadata, f, indent=2, ensure_ascii=False)
        logger.info(f"模型元数据已保存: {metadata_path}")
    
    def perform_data_quality_check(self, data):
        """执行数据质量检查"""
        logger.info("执行数据质量检查...")
        
        checks = {
            '总记录数': len(data),
            '空值记录数': data.isnull().any(axis=1).sum(),
            '重复记录数': data.duplicated().sum(),
            '价格范围': f"{data['transaction_amount'].min():.2f} - {data['transaction_amount'].max():.2f}",
            '设备型号数': data['product_model'].nunique()
        }
        
        for check_name, result in checks.items():
            logger.info(f"  {check_name}: {result}")
    
    def generate_training_report(self, results, start_time):
        """生成训练报告"""
        duration = datetime.now() - start_time
        
        report = f"""
=====================================================
🤖 机器学习模型训练报告
=====================================================
开始时间: {start_time.strftime('%Y-%m-%d %H:%M:%S')}
结束时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
总耗时: {duration}
使用市场特征: {'是' if self.use_market_features else '否'}
超参数调优: {'是' if self.tune_hyperparams else '否'}

📊 模型性能对比:
"""
        
        for model_name, metrics in results.items():
            report += f"\n{model_name}:\n"
            report += f"  RMSE: {metrics['rmse']:.2f}\n"
            report += f"  MAE: {metrics['mae']:.2f}\n"
            report += f"  R²: {metrics['r2']:.4f}\n"
        
        report += f"""
🏆 最佳模型: {self.model_trainer.best_model_name}
🎯 最佳RMSE: {results[self.model_trainer.best_model_name]['rmse']:.2f}

📁 输出文件:
- 模型文件: {Config.MODEL_SAVE_PATH}/{self.model_trainer.best_model_name}.pkl
- 特征重要性: {Config.MODEL_SAVE_PATH}/{self.model_trainer.best_model_name}_feature_importance.csv
- 可视化图表: {Config.MODEL_SAVE_PATH}/feature_importance.png
- 模型元数据: {Config.MODEL_SAVE_PATH}/model_metadata.json

🚀 下一步:
1. 启动模型API服务: python api/api_service.py
2. 验证API接口可用性
3. 集成到Node.js应用中
4. 进行A/B测试验证效果
=====================================================
"""
        
        logger.info(report)
        
        # 保存报告到文件
        report_path = f"{Config.MODEL_SAVE_PATH}/training_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"
        with open(report_path, 'w', encoding='utf-8') as f:
            f.write(report)
        logger.info(f"训练报告已保存: {report_path}")

def main():
    parser = argparse.ArgumentParser(description='机器学习模型训练流水线')
    parser.add_argument('--no-market', action='store_true', 
                       help='不使用市场特征进行训练')
    parser.add_argument('--tune', action='store_true',
                       help='启用超参数调优')
    parser.add_argument('--debug', action='store_true',
                       help='启用调试模式')
    
    args = parser.parse_args()
    
    if args.debug:
        Config.LOG_LEVEL = 'DEBUG'
    
    # 创建训练流水线实例
    pipeline = MLTrainingPipeline(
        use_market_features=not args.no_market,
        tune_hyperparams=args.tune
    )
    
    # 运行训练
    success = pipeline.run_complete_pipeline()
    
    if success:
        print("\n🎉 训练完成! 模型已准备好部署。")
        print(f"📁 模型文件位置: {Config.MODEL_SAVE_PATH}")
    else:
        print("\n❌ 训练失败，请检查日志了解详细信息。")

if __name__ == "__main__":
    main()