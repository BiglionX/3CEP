"""
V-ML-06: 市场特征增强模块
集成实时市场均价特征到机器学习模型
"""

import pandas as pd
import numpy as np
from utils.database import DatabaseManager
from preprocessing.data_processor import DataProcessor
from config import Config
import logging

logger = logging.getLogger(__name__)

class MarketFeatureEnhancer:
    def __init__(self):
        self.db_manager = DatabaseManager()
        self.data_processor = DataProcessor()
        
    def enhance_with_market_features(self, training_data):
        """
        使用实时市场数据增强训练数据
        """
        logger.info("开始市场特征增强...")
        
        # 获取唯一的设备型号列表
        unique_models = training_data['product_model'].unique()
        logger.info(f"需要获取市场数据的设备型号数: {len(unique_models)}")
        
        # 从数据库获取市场特征
        market_features = self.db_manager.get_market_features(unique_models)
        logger.info(f"成功获取 {len(market_features)} 个型号的市场数据")
        
        # 集成市场特征到训练数据
        enhanced_data = self.data_processor.integrate_market_features(
            training_data.copy(), 
            market_features
        )
        
        # 添加市场相关衍生特征
        enhanced_data = self.create_market_derived_features(enhanced_data)
        
        logger.info("市场特征增强完成")
        logger.info(f"增强后数据形状: {enhanced_data.shape}")
        
        return enhanced_data, market_features
    
    def create_market_derived_features(self, df):
        """
        创建市场相关的衍生特征
        """
        logger.info("创建市场衍生特征...")
        
        # 价格偏差特征
        df['price_deviation_from_market'] = (
            df['transaction_amount'] - df['market_avg_price']
        ) / df['market_avg_price']
        
        # 价格区间特征
        df['price_position_in_range'] = (
            (df['transaction_amount'] - df['market_min_price']) / 
            (df['market_max_price'] - df['market_min_price'])
        )
        
        # 市场热度特征
        df['market_activity_score'] = np.log1p(df['market_sample_count'])
        
        # 市场数据新鲜度加权
        df['weighted_freshness'] = (
            df['market_freshness_score'] * df['market_sample_count'] / 100
        )
        
        # 价格稳定性特征
        df['price_stability'] = 1 - (
            (df['market_max_price'] - df['market_min_price']) / 
            df['market_avg_price']
        )
        
        # 填充可能产生的无穷大或NaN值
        market_derived_cols = [
            'price_deviation_from_market', 'price_position_in_range',
            'market_activity_score', 'weighted_freshness', 'price_stability'
        ]
        
        for col in market_derived_cols:
            df[col] = df[col].replace([np.inf, -np.inf], np.nan)
            df[col] = df[col].fillna(0)
        
        logger.info(f"创建了 {len(market_derived_cols)} 个市场衍生特征")
        return df
    
    def retrain_with_market_features(self, base_training_data):
        """
        使用市场增强特征重新训练模型
        """
        logger.info("开始使用市场特征重新训练模型...")
        
        # 增强特征
        enhanced_data, market_features = self.enhance_with_market_features(base_training_data)
        
        # 数据处理流水线
        X_enhanced, y, processed_data = self.data_processor.process_complete_pipeline(
            enhanced_data, market_features
        )
        
        # 保存增强后的特征列
        self.save_enhanced_feature_info(X_enhanced.columns.tolist())
        
        logger.info("市场特征增强训练数据准备完成")
        return X_enhanced, y, processed_data
    
    def save_enhanced_feature_info(self, feature_columns):
        """
        保存增强后的特征信息
        """
        feature_path = f"{Config.MODEL_SAVE_PATH}/enhanced_feature_columns.txt"
        with open(feature_path, 'w') as f:
            for col in feature_columns:
                f.write(f"{col}\n")
        logger.info(f"增强特征列已保存至: {feature_path}")
        
        # 也保存到原始位置以保持兼容性
        original_path = f"{Config.MODEL_SAVE_PATH}/feature_columns.txt"
        with open(original_path, 'w') as f:
            for col in feature_columns:
                f.write(f"{col}\n")

    def get_realtime_market_context(self, device_model):
        """
        获取设备型号的实时市场上下文（用于在线预测）
        """
        market_features = self.db_manager.get_market_features([device_model])
        return market_features.get(device_model, {})
    
    def prepare_online_prediction_features(self, device_features, market_context=None):
        """
        为在线预测准备包含市场特征的特征向量
        """
        if market_context is None:
            device_model = device_features.get('product_model')
            if device_model:
                market_context = self.get_realtime_market_context(device_model)
            else:
                market_context = {}
        
        # 合并设备特征和市场特征
        combined_features = device_features.copy()
        combined_features.update({
            'market_avg_price': market_context.get('avg_price', 3000),
            'market_min_price': market_context.get('min_price', 2000),
            'market_max_price': market_context.get('max_price', 4000),
            'market_sample_count': market_context.get('sample_count', 10),
            'market_freshness_score': market_context.get('freshness_score', 0.5)
        })
        
        return combined_features

# 测试代码
if __name__ == "__main__":
    enhancer = MarketFeatureEnhancer()
    print("市场特征增强器初始化完成")
    
    # 测试市场上下文获取
    test_model = "iPhone 14"
    context = enhancer.get_realtime_market_context(test_model)
    print(f"{test_model} 的市场上下文: {context}")