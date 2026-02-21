"""
V-ML-04: 机器学习模型API服务
使用FastAPI创建REST API服务
"""
from fastapi import FastAPI, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import joblib
import numpy as np
import pandas as pd
from config import Config
import logging
import uvicorn
from datetime import datetime

# 配置日志
logging.basicConfig(level=getattr(logging, Config.LOG_LEVEL))
logger = logging.getLogger(__name__)

# 初始化FastAPI应用
app = FastAPI(
    title="设备估价ML模型API",
    description="基于机器学习的二手设备价格预测服务",
    version="1.0.0"
)

# 全局变量
model = None
feature_columns = None

class PredictionRequest(BaseModel):
    """单次预测请求"""
    device_age_months: float
    brand_encoded: int
    storage_gb: float
    ram_gb: float
    screen_condition_encoded: int
    battery_health_percent: float
    appearance_grade_encoded: int
    repair_count: int
    part_replacement_count: int
    transfer_count: int
    market_avg_price: Optional[float] = None
    market_min_price: Optional[float] = None
    market_max_price: Optional[float] = None
    market_sample_count: Optional[int] = None

class BatchPredictionRequest(BaseModel):
    """批量预测请求"""
    devices: List[PredictionRequest]

class PredictionResponse(BaseModel):
    """预测响应"""
    predicted_price: float
    confidence: float
    prediction_time: str
    model_version: str = "1.0.0"

class BatchPredictionResponse(BaseModel):
    """批量预测响应"""
    predictions: List[PredictionResponse]
    total_processing_time: float

def load_model():
    """加载训练好的模型"""
    global model, feature_columns
    
    try:
        # 加载模型
        model_path = f"{Config.MODEL_SAVE_PATH}/lightgbm.pkl"  # 假设使用LightGBM模型
        model = joblib.load(model_path)
        logger.info(f"模型加载成功: {model_path}")
        
        # 加载特征列信息
        feature_path = f"{Config.MODEL_SAVE_PATH}/feature_columns.txt"
        with open(feature_path, 'r') as f:
            feature_columns = [line.strip() for line in f.readlines()]
        logger.info(f"特征列加载成功: {len(feature_columns)} 个特征")
        
    except Exception as e:
        logger.error(f"模型加载失败: {e}")
        raise

def prepare_features(request: PredictionRequest) -> np.ndarray:
    """准备特征向量"""
    features = []
    
    # 按照训练时的特征顺序排列
    feature_mapping = {
        'device_age_months': request.device_age_months,
        'brand_encoded': request.brand_encoded,
        'storage_gb': request.storage_gb,
        'ram_gb': request.ram_gb,
        'screen_condition_encoded': request.screen_condition_encoded,
        'battery_health_percent': request.battery_health_percent,
        'appearance_grade_encoded': request.appearance_grade_encoded,
        'repair_count': request.repair_count,
        'part_replacement_count': request.part_replacement_count,
        'transfer_count': request.transfer_count,
        'market_avg_price': request.market_avg_price or 3000,  # 默认值
        'market_min_price': request.market_min_price or 2000,
        'market_max_price': request.market_max_price or 4000,
        'market_sample_count': request.market_sample_count or 10
    }
    
    # 按照特征列顺序提取特征
    for col in feature_columns:
        if col in feature_mapping:
            features.append(feature_mapping[col])
        else:
            features.append(0)  # 默认值
    
    return np.array(features).reshape(1, -1)

def calculate_confidence(prediction: float, features: np.ndarray) -> float:
    """计算预测置信度"""
    # 简化的置信度计算
    # 实际应用中可以使用更复杂的统计方法
    
    # 基于特征完整性的置信度
    feature_completeness = 1.0 - np.sum(np.isnan(features)) / len(features)
    
    # 基于预测值合理性的置信度
    price_reasonableness = 1.0
    if prediction < 100 or prediction > 20000:  # 异常价格范围
        price_reasonableness = 0.3
    elif prediction < 500 or prediction > 10000:  # 边缘价格范围
        price_reasonableness = 0.7
    else:  # 正常价格范围
        price_reasonableness = 0.9
    
    # 综合置信度
    confidence = (feature_completeness * 0.4 + price_reasonableness * 0.6)
    return round(confidence, 3)

@app.on_event("startup")
async def startup_event():
    """应用启动时加载模型"""
    logger.info("正在启动ML模型服务...")
    load_model()
    logger.info("ML模型服务启动完成")

@app.get("/")
async def root():
    """根路径"""
    return {
        "message": "设备估价ML模型API服务",
        "status": "running",
        "model_loaded": model is not None,
        "feature_count": len(feature_columns) if feature_columns else 0
    }

@app.get("/health")
async def health_check():
    """健康检查"""
    if model is None:
        raise HTTPException(status_code=503, detail="模型未加载")
    
    return {
        "status": "healthy",
        "model_loaded": True,
        "feature_count": len(feature_columns),
        "timestamp": datetime.now().isoformat()
    }

@app.post("/predict", response_model=PredictionResponse)
async def predict_price(request: PredictionRequest):
    """单次价格预测"""
    if model is None:
        raise HTTPException(status_code=503, detail="模型未加载")
    
    try:
        start_time = datetime.now()
        
        # 准备特征
        features = prepare_features(request)
        
        # 预测
        prediction = model.predict(features)[0]
        
        # 计算置信度
        confidence = calculate_confidence(prediction, features)
        
        processing_time = (datetime.now() - start_time).total_seconds()
        
        return PredictionResponse(
            predicted_price=float(prediction),
            confidence=confidence,
            prediction_time=datetime.now().isoformat(),
            model_version="1.0.0"
        )
        
    except Exception as e:
        logger.error(f"预测失败: {e}")
        raise HTTPException(status_code=500, detail=f"预测失败: {str(e)}")

@app.post("/predict/batch", response_model=BatchPredictionResponse)
async def batch_predict(request: BatchPredictionRequest):
    """批量价格预测"""
    if model is None:
        raise HTTPException(status_code=503, detail="模型未加载")
    
    try:
        start_time = datetime.now()
        predictions = []
        
        for device_request in request.devices:
            # 准备特征
            features = prepare_features(device_request)
            
            # 预测
            prediction = model.predict(features)[0]
            
            # 计算置信度
            confidence = calculate_confidence(prediction, features)
            
            predictions.append(PredictionResponse(
                predicted_price=float(prediction),
                confidence=confidence,
                prediction_time=datetime.now().isoformat(),
                model_version="1.0.0"
            ))
        
        total_time = (datetime.now() - start_time).total_seconds()
        
        return BatchPredictionResponse(
            predictions=predictions,
            total_processing_time=total_time
        )
        
    except Exception as e:
        logger.error(f"批量预测失败: {e}")
        raise HTTPException(status_code=500, detail=f"批量预测失败: {str(e)}")

@app.get("/model/info")
async def model_info():
    """获取模型信息"""
    if model is None:
        raise HTTPException(status_code=503, detail="模型未加载")
    
    try:
        # 获取模型参数（如果支持）
        model_params = {}
        if hasattr(model, 'get_params'):
            model_params = model.get_params()
        
        return {
            "model_type": type(model).__name__,
            "feature_count": len(feature_columns),
            "feature_names": feature_columns,
            "model_parameters": model_params,
            "loaded_at": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"获取模型信息失败: {e}")
        raise HTTPException(status_code=500, detail="获取模型信息失败")

@app.post("/model/reload")
async def reload_model(background_tasks: BackgroundTasks):
    """重新加载模型"""
    try:
        background_tasks.add_task(load_model)
        return {"message": "模型重载任务已启动"}
    except Exception as e:
        logger.error(f"模型重载失败: {e}")
        raise HTTPException(status_code=500, detail=f"模型重载失败: {str(e)}")

if __name__ == "__main__":
    # 启动服务
    Config.init_paths()
    uvicorn.run(
        "api_service:app",
        host=Config.API_HOST,
        port=Config.API_PORT,
        reload=Config.API_DEBUG,
        log_level=Config.LOG_LEVEL.lower()
    )