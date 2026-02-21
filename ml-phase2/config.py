"""
机器学习模型配置文件
"""
import os
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

class Config:
    # 数据库配置
    DATABASE_URL = os.getenv('DATABASE_URL', 'postgresql://user:password@localhost:5432/threecp')
    
    # 模型配置
    MODEL_SAVE_PATH = './models'
    DATA_SAVE_PATH = './data'
    
    # 特征配置
    FEATURE_COLUMNS = [
        'device_age_months',
        'brand_encoded',
        'storage_gb',
        'ram_gb', 
        'screen_condition_encoded',
        'battery_health_percent',
        'appearance_grade_encoded',
        'repair_count',
        'part_replacement_count',
        'transfer_count',
        'market_avg_price',
        'market_min_price',
        'market_max_price',
        'market_sample_count'
    ]
    
    TARGET_COLUMN = 'actual_transaction_price'
    
    # 模型参数
    LGBM_PARAMS = {
        'objective': 'regression',
        'metric': 'rmse',
        'boosting_type': 'gbdt',
        'num_leaves': 31,
        'learning_rate': 0.05,
        'feature_fraction': 0.9,
        'bagging_fraction': 0.8,
        'bagging_freq': 5,
        'verbose': 0,
        'random_state': 42
    }
    
    # 训练配置
    TEST_SIZE = 0.2
    RANDOM_STATE = 42
    CV_FOLDS = 5
    
    # API配置
    API_HOST = os.getenv('ML_API_HOST', '0.0.0.0')
    API_PORT = int(os.getenv('ML_API_PORT', 8000))
    API_DEBUG = os.getenv('ML_API_DEBUG', 'False').lower() == 'true'
    
    # 日志配置
    LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
    
    @classmethod
    def init_paths(cls):
        """初始化必要的目录"""
        import os
        os.makedirs(cls.MODEL_SAVE_PATH, exist_ok=True)
        os.makedirs(cls.DATA_SAVE_PATH, exist_ok=True)