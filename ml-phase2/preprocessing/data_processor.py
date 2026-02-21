"""
V-ML-02: 数据清洗与特征工程
"""
import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.model_selection import train_test_split
from config import Config
import logging

logger = logging.getLogger(__name__)

class DataProcessor:
    def __init__(self):
        self.label_encoders = {}
        self.scaler = StandardScaler()
        self.is_fitted = False
        
    def clean_data(self, df):
        """数据清洗"""
        logger.info("开始数据清洗...")
        
        # 删除空值过多的行
        df = df.dropna(subset=['transaction_amount', 'product_model'])
        
        # 处理重复数据
        df = df.drop_duplicates(subset=['transaction_id'])
        
        # 数据类型转换
        df['transaction_amount'] = pd.to_numeric(df['transaction_amount'], errors='coerce')
        df['transaction_date'] = pd.to_datetime(df['transaction_date'], errors='coerce')
        
        # 删除异常值
        df = df[df['transaction_amount'] > 0]
        df = df[df['transaction_amount'] < 50000]  # 假设合理价格上限
        
        logger.info(f"清洗后剩余 {len(df)} 条记录")
        return df
    
    def extract_device_age(self, df):
        """提取设备年龄特征"""
        logger.info("提取设备年龄特征...")
        
        # 假设设备制造日期可以从型号推断或从其他字段获取
        # 这里简化处理，使用交易日期作为参考
        current_year = pd.Timestamp.now().year
        
        # 简化的年龄计算（实际应用中应该从设备档案获取准确制造日期）
        df['device_year'] = df['product_model'].str.extract(r'(\d{4})')[0]
        df['device_year'] = pd.to_numeric(df['device_year'], errors='coerce').fillna(current_year - 2)
        
        df['device_age_months'] = (current_year - df['device_year']) * 12
        df['device_age_months'] = df['device_age_months'].clip(lower=0, upper=120)  # 限制在0-120个月
        
        return df
    
    def extract_storage_ram_features(self, df):
        """提取存储和内存特征"""
        logger.info("提取存储和内存特征...")
        
        # 处理存储容量
        def parse_storage(storage_str):
            if pd.isna(storage_str):
                return np.nan
            storage_str = str(storage_str).upper()
            if 'TB' in storage_str:
                return float(storage_str.replace('TB', '').strip()) * 1024
            elif 'GB' in storage_str:
                return float(storage_str.replace('GB', '').strip())
            else:
                return np.nan
                
        df['storage_gb'] = df['storage'].apply(parse_storage)
        df['storage_gb'] = df['storage_gb'].fillna(128)  # 默认128GB
        
        # 处理内存
        def parse_ram(ram_str):
            if pd.isna(ram_str):
                return np.nan
            ram_str = str(ram_str).upper()
            if 'GB' in ram_str:
                return float(ram_str.replace('GB', '').strip())
            else:
                return np.nan
                
        df['ram_gb'] = df['ram'].apply(parse_ram)
        df['ram_gb'] = df['ram_gb'].fillna(8)  # 默认8GB
        
        return df
    
    def encode_categorical_features(self, df):
        """编码分类特征"""
        logger.info("编码分类特征...")
        
        # 品牌编码
        if 'brand_name' in df.columns:
            le_brand = LabelEncoder()
            df['brand_encoded'] = le_brand.fit_transform(df['brand_name'].fillna('Unknown'))
            self.label_encoders['brand'] = le_brand
        
        # 屏幕状况编码
        screen_mapping = {
            '完美': 5, '良好': 4, '一般': 3, '较差': 2, '严重': 1,
            'Excellent': 5, 'Good': 4, 'Fair': 3, 'Poor': 2, 'Bad': 1
        }
        df['screen_condition_encoded'] = df['screen_condition'].map(screen_mapping).fillna(3)
        
        # 外观等级编码
        appearance_mapping = {
            '全新': 5, '九成新': 4, '八成新': 3, '七成新': 2, '六成新': 1,
            'New': 5, 'Like New': 4, 'Good': 3, 'Fair': 2, 'Poor': 1
        }
        df['appearance_grade_encoded'] = df['appearance_grade'].map(appearance_mapping).fillna(3)
        
        return df
    
    def extract_battery_features(self, df):
        """提取电池健康度特征"""
        logger.info("提取电池健康特征...")
        
        def parse_battery_health(battery_str):
            if pd.isna(battery_str):
                return np.nan
            battery_str = str(battery_str)
            # 处理百分比格式
            if '%' in battery_str:
                return float(battery_str.replace('%', '').strip())
            # 处理文字描述
            elif '优秀' in battery_str or 'Excellent' in battery_str:
                return 95
            elif '良好' in battery_str or 'Good' in battery_str:
                return 85
            elif '一般' in battery_str or 'Fair' in battery_str:
                return 70
            elif '较差' in battery_str or 'Poor' in battery_str:
                return 50
            else:
                return 75  # 默认值
                
        df['battery_health_percent'] = df['battery_health'].apply(parse_battery_health)
        df['battery_health_percent'] = df['battery_health_percent'].fillna(80)
        
        return df
    
    def integrate_market_features(self, df, market_features):
        """集成市场特征"""
        logger.info("集成市场特征...")
        
        # 为每个设备型号添加市场特征
        market_columns = ['market_avg_price', 'market_min_price', 'market_max_price', 
                         'market_sample_count', 'market_freshness_score']
        
        for col in market_columns:
            df[col] = np.nan
            
        for idx, row in df.iterrows():
            model = row['product_model']
            if model in market_features:
                market_data = market_features[model]
                df.at[idx, 'market_avg_price'] = market_data.get('avg_price', np.nan)
                df.at[idx, 'market_min_price'] = market_data.get('min_price', np.nan)
                df.at[idx, 'market_max_price'] = market_data.get('max_price', np.nan)
                df.at[idx, 'market_sample_count'] = market_data.get('sample_count', 0)
                df.at[idx, 'market_freshness_score'] = market_data.get('freshness_score', 0.5)
        
        # 填充缺失的市场特征
        df['market_avg_price'] = df['market_avg_price'].fillna(df['market_avg_price'].median())
        df['market_min_price'] = df['market_min_price'].fillna(df['market_min_price'].median())
        df['market_max_price'] = df['market_max_price'].fillna(df['market_max_price'].median())
        df['market_sample_count'] = df['market_sample_count'].fillna(0)
        df['market_freshness_score'] = df['market_freshness_score'].fillna(0.5)
        
        return df
    
    def prepare_features_and_target(self, df):
        """准备特征和目标变量"""
        logger.info("准备特征和目标变量...")
        
        # 选择特征列
        available_features = [col for col in Config.FEATURE_COLUMNS if col in df.columns]
        X = df[available_features].copy()
        
        # 目标变量
        y = df['transaction_amount'].copy()
        
        # 处理缺失值
        X = X.fillna(X.median())
        
        return X, y
    
    def scale_features(self, X, fit=True):
        """特征标准化"""
        if fit:
            X_scaled = self.scaler.fit_transform(X)
            self.is_fitted = True
        else:
            X_scaled = self.scaler.transform(X)
            
        return pd.DataFrame(X_scaled, columns=X.columns, index=X.index)
    
    def process_complete_pipeline(self, df, market_features=None):
        """完整的数据处理流水线"""
        logger.info("开始完整的数据处理流水线...")
        
        # 1. 数据清洗
        df_cleaned = self.clean_data(df)
        
        # 2. 特征提取
        df_features = self.extract_device_age(df_cleaned)
        df_features = self.extract_storage_ram_features(df_features)
        df_features = self.encode_categorical_features(df_features)
        df_features = self.extract_battery_features(df_features)
        
        # 3. 集成市场特征（如果有）
        if market_features:
            df_features = self.integrate_market_features(df_features, market_features)
        
        # 4. 准备特征和目标
        X, y = self.prepare_features_and_target(df_features)
        
        # 5. 特征标准化
        X_scaled = self.scale_features(X, fit=True)
        
        logger.info("数据处理流水线完成")
        logger.info(f"特征维度: {X_scaled.shape}")
        logger.info(f"目标变量范围: {y.min():.2f} - {y.max():.2f}")
        
        return X_scaled, y, df_features
    
    def split_data(self, X, y, test_size=0.2):
        """划分训练集和测试集"""
        return train_test_split(
            X, y, 
            test_size=test_size, 
            random_state=Config.RANDOM_STATE
        )

if __name__ == "__main__":
    # 测试数据处理器
    processor = DataProcessor()
    print("数据处理器初始化完成")