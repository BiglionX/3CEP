"""
数据库连接和数据采集工具
"""
import pandas as pd
import psycopg2
from sqlalchemy import create_engine
from config import Config
import logging

logger = logging.getLogger(__name__)

class DatabaseManager:
    def __init__(self):
        self.engine = create_engine(Config.DATABASE_URL)
        
    def get_connection(self):
        """获取数据库连接"""
        return self.engine.connect()
    
    def collect_training_data(self):
        """
        V-ML-01: 从LIFE档案和订单系统收集训练数据
        """
        logger.info("开始采集训练数据...")
        
        # 查询已完成的交易记录
        transaction_query = """
        SELECT 
            cp.id as transaction_id,
            cp.project_id,
            cp.amount as transaction_amount,
            cp.old_device_qrcode,
            cp.created_at as transaction_date,
            dp.product_model,
            dp.brand_name,
            dp.specifications->>'storage' as storage,
            dp.specifications->>'ram' as ram,
            dp.total_repair_count,
            dp.total_part_replacement_count,
            dp.total_transfer_count,
            dle.event_data->>'screen_condition' as screen_condition,
            dle.event_data->>'battery_health' as battery_health,
            dle.event_data->>'appearance_grade' as appearance_grade
        FROM crowdfunding_pledges cp
        LEFT JOIN device_profiles dp ON cp.old_device_qrcode = dp.qrcode_id
        LEFT JOIN device_lifecycle_events dle ON dp.qrcode_id = dle.device_qrcode_id 
            AND dle.event_type = 'assessed'
        WHERE cp.status = 'confirmed'
            AND cp.old_device_qrcode IS NOT NULL
        """
        
        # 查询维修订单数据
        repair_query = """
        SELECT 
            ro.id as transaction_id,
            ro.user_id,
            ro.fcx_amount_locked as transaction_amount,
            di->>'qrcodeId' as device_qrcode,
            di->>'brand' as brand_name,
            di->>'model' as product_model,
            di->>'storage' as storage,
            di->>'ram' as ram,
            ro.completed_at as transaction_date,
            0 as total_repair_count,
            0 as total_part_replacement_count,
            0 as total_transfer_count,
            NULL as screen_condition,
            NULL as battery_health,
            NULL as appearance_grade
        FROM repair_orders ro,
        LATERAL jsonb_to_record(ro.device_info) AS di(qrcodeId text, brand text, model text, storage text, ram text)
        WHERE ro.status = 'completed'
            AND ro.device_info IS NOT NULL
        """
        
        try:
            # 执行查询
            with self.get_connection() as conn:
                transactions_df = pd.read_sql(transaction_query, conn)
                repair_df = pd.read_sql(repair_query, conn)
            
            # 合并数据
            training_data = pd.concat([transactions_df, repair_df], ignore_index=True)
            
            logger.info(f"成功采集 {len(training_data)} 条训练记录")
            return training_data
            
        except Exception as e:
            logger.error(f"数据采集失败: {e}")
            raise
    
    def get_market_features(self, device_models):
        """
        获取市场特征数据
        """
        if not device_models:
            return {}
            
        market_query = """
        SELECT 
            device_model,
            avg_price,
            min_price,
            max_price,
            sample_count,
            freshness_score
        FROM market_prices 
        WHERE device_model = ANY(%s)
            AND source = 'aggregate'
        ORDER BY collected_at DESC
        """
        
        try:
            with self.get_connection() as conn:
                market_df = pd.read_sql(market_query, conn, params=(list(device_models),))
                
            # 转换为字典格式便于查找
            market_features = {}
            for _, row in market_df.iterrows():
                market_features[row['device_model']] = {
                    'avg_price': row['avg_price'],
                    'min_price': row['min_price'], 
                    'max_price': row['max_price'],
                    'sample_count': row['sample_count'],
                    'freshness_score': row['freshness_score']
                }
                
            return market_features
            
        except Exception as e:
            logger.error(f"获取市场特征失败: {e}")
            return {}

    def save_processed_data(self, df, filename):
        """保存处理后的数据"""
        filepath = f"{Config.DATA_SAVE_PATH}/{filename}"
        df.to_csv(filepath, index=False)
        logger.info(f"数据已保存至: {filepath}")

if __name__ == "__main__":
    # 测试数据库连接
    db_manager = DatabaseManager()
    try:
        data = db_manager.collect_training_data()
        print(f"成功采集 {len(data)} 条数据")
        print(data.head())
    except Exception as e:
        print(f"测试失败: {e}")