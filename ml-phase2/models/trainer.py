"""
V-ML-03: 模型训练与调优
"""
import lightgbm as lgb
import xgboost as xgb
from sklearn.model_selection import cross_val_score, GridSearchCV
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
import joblib
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from config import Config
import logging

logger = logging.getLogger(__name__)

class ModelTrainer:
    def __init__(self):
        self.models = {}
        self.best_model = None
        self.best_model_name = None
        self.feature_importance = None
        
    def train_lightgbm(self, X_train, y_train, X_val=None, y_val=None):
        """训练LightGBM模型"""
        logger.info("训练LightGBM模型...")
        
        # 创建数据集
        train_data = lgb.Dataset(X_train, label=y_train)
        
        # 训练模型
        model = lgb.train(
            Config.LGBM_PARAMS,
            train_data,
            num_boost_round=1000,
            valid_sets=[train_data] if X_val is None else [train_data, lgb.Dataset(X_val, y_val)],
            callbacks=[
                lgb.early_stopping(stopping_rounds=50),
                lgb.log_evaluation(period=100)
            ]
        )
        
        self.models['lightgbm'] = model
        logger.info("LightGBM训练完成")
        return model
    
    def train_xgboost(self, X_train, y_train, X_val=None, y_val=None):
        """训练XGBoost模型"""
        logger.info("训练XGBoost模型...")
        
        # XGBoost参数
        xgb_params = {
            'objective': 'reg:squarederror',
            'eval_metric': 'rmse',
            'learning_rate': 0.05,
            'max_depth': 6,
            'subsample': 0.8,
            'colsample_bytree': 0.9,
            'random_state': Config.RANDOM_STATE
        }
        
        model = xgb.XGBRegressor(**xgb_params)
        model.fit(
            X_train, y_train,
            eval_set=[(X_val, y_val)] if X_val is not None else None,
            early_stopping_rounds=50 if X_val is not None else None,
            verbose=False
        )
        
        self.models['xgboost'] = model
        logger.info("XGBoost训练完成")
        return model
    
    def hyperparameter_tuning(self, X_train, y_train, model_type='lightgbm'):
        """超参数调优"""
        logger.info(f"对{model_type}进行超参数调优...")
        
        if model_type == 'lightgbm':
            param_grid = {
                'num_leaves': [15, 31, 63],
                'learning_rate': [0.01, 0.05, 0.1],
                'feature_fraction': [0.7, 0.8, 0.9],
                'bagging_fraction': [0.7, 0.8, 0.9]
            }
            
            base_model = lgb.LGBMRegressor(**Config.LGBM_PARAMS)
            grid_search = GridSearchCV(
                base_model, param_grid,
                cv=3, scoring='neg_mean_squared_error',
                n_jobs=-1, verbose=1
            )
            grid_search.fit(X_train, y_train)
            
            best_model = grid_search.best_estimator_
            self.models[f'{model_type}_tuned'] = best_model
            
        elif model_type == 'xgboost':
            param_grid = {
                'max_depth': [3, 6, 9],
                'learning_rate': [0.01, 0.05, 0.1],
                'subsample': [0.7, 0.8, 0.9],
                'colsample_bytree': [0.7, 0.8, 0.9]
            }
            
            base_model = xgb.XGBRegressor(random_state=Config.RANDOM_STATE)
            grid_search = GridSearchCV(
                base_model, param_grid,
                cv=3, scoring='neg_mean_squared_error',
                n_jobs=-1, verbose=1
            )
            grid_search.fit(X_train, y_train)
            
            best_model = grid_search.best_estimator_
            self.models[f'{model_type}_tuned'] = best_model
            
        logger.info(f"{model_type}超参数调优完成")
        logger.info(f"最佳参数: {grid_search.best_params_}")
        return best_model
    
    def evaluate_model(self, model, X_test, y_test, model_name):
        """评估模型性能"""
        logger.info(f"评估{model_name}模型...")
        
        # 预测
        if hasattr(model, 'predict'):
            y_pred = model.predict(X_test)
        else:
            # LightGBM booster
            y_pred = model.predict(X_test)
        
        # 计算评估指标
        mse = mean_squared_error(y_test, y_pred)
        rmse = np.sqrt(mse)
        mae = mean_absolute_error(y_test, y_pred)
        r2 = r2_score(y_test, y_pred)
        
        metrics = {
            'mse': mse,
            'rmse': rmse,
            'mae': mae,
            'r2': r2
        }
        
        logger.info(f"{model_name}评估结果:")
        logger.info(f"  RMSE: {rmse:.2f}")
        logger.info(f"  MAE: {mae:.2f}")
        logger.info(f"  R²: {r2:.4f}")
        
        return metrics, y_pred
    
    def compare_models(self, X_test, y_test):
        """比较所有训练的模型"""
        logger.info("比较所有模型性能...")
        
        results = {}
        
        for model_name, model in self.models.items():
            metrics, _ = self.evaluate_model(model, X_test, y_test, model_name)
            results[model_name] = metrics
        
        # 选择最佳模型（基于RMSE）
        best_model_name = min(results.keys(), key=lambda k: results[k]['rmse'])
        self.best_model = self.models[best_model_name]
        self.best_model_name = best_model_name
        
        logger.info(f"最佳模型: {best_model_name}")
        logger.info(f"最佳RMSE: {results[best_model_name]['rmse']:.2f}")
        
        return results
    
    def get_feature_importance(self, model, feature_names):
        """获取特征重要性"""
        if hasattr(model, 'feature_importances_'):
            importance = model.feature_importances_
        elif hasattr(model, 'booster_'):
            importance = model.booster_.feature_importance(importance_type='gain')
        else:
            # LightGBM booster
            importance = model.feature_importance(importance_type='gain')
        
        self.feature_importance = pd.DataFrame({
            'feature': feature_names,
            'importance': importance
        }).sort_values('importance', ascending=False)
        
        return self.feature_importance
    
    def plot_feature_importance(self, top_n=15):
        """绘制特征重要性图"""
        if self.feature_importance is None:
            logger.warning("尚未计算特征重要性")
            return
            
        plt.figure(figsize=(10, 8))
        top_features = self.feature_importance.head(top_n)
        sns.barplot(data=top_features, x='importance', y='feature')
        plt.title('Top Feature Importance')
        plt.xlabel('Importance')
        plt.tight_layout()
        plt.savefig(f'{Config.MODEL_SAVE_PATH}/feature_importance.png')
        plt.close()
        
    def plot_predictions_vs_actual(self, y_true, y_pred, model_name):
        """绘制预测值vs实际值散点图"""
        plt.figure(figsize=(10, 8))
        plt.scatter(y_true, y_pred, alpha=0.6)
        plt.plot([y_true.min(), y_true.max()], [y_true.min(), y_true.max()], 'r--', lw=2)
        plt.xlabel('Actual Price')
        plt.ylabel('Predicted Price')
        plt.title(f'{model_name}: Predictions vs Actual')
        plt.tight_layout()
        plt.savefig(f'{Config.MODEL_SAVE_PATH}/{model_name}_predictions.png')
        plt.close()
    
    def save_model(self, model_name=None):
        """保存模型"""
        if model_name is None:
            model_name = self.best_model_name
            model = self.best_model
        else:
            model = self.models[model_name]
            
        if model is None:
            logger.error("没有可保存的模型")
            return
            
        model_path = f'{Config.MODEL_SAVE_PATH}/{model_name}.pkl'
        joblib.dump(model, model_path)
        logger.info(f"模型已保存至: {model_path}")
        
        # 保存特征重要性
        if self.feature_importance is not None:
            importance_path = f'{Config.MODEL_SAVE_PATH}/{model_name}_feature_importance.csv'
            self.feature_importance.to_csv(importance_path, index=False)
            logger.info(f"特征重要性已保存至: {importance_path}")
    
    def train_complete_pipeline(self, X_train, y_train, X_test, y_test, tune_hyperparams=False):
        """完整的训练流水线"""
        logger.info("开始完整的模型训练流水线...")
        
        # 训练基础模型
        lgb_model = self.train_lightgbm(X_train, y_train, X_test, y_test)
        xgb_model = self.train_xgboost(X_train, y_train, X_test, y_test)
        
        # 超参数调优（可选）
        if tune_hyperparams:
            self.hyperparameter_tuning(X_train, y_train, 'lightgbm')
            self.hyperparameter_tuning(X_train, y_train, 'xgboost')
        
        # 模型比较
        results = self.compare_models(X_test, y_test)
        
        # 特征重要性分析
        feature_names = X_train.columns.tolist()
        self.get_feature_importance(self.best_model, feature_names)
        self.plot_feature_importance()
        
        # 预测效果可视化
        _, y_pred = self.evaluate_model(self.best_model, X_test, y_test, self.best_model_name)
        self.plot_predictions_vs_actual(y_test, y_pred, self.best_model_name)
        
        # 保存最佳模型
        self.save_model()
        
        logger.info("模型训练流水线完成")
        return results

if __name__ == "__main__":
    # 测试模型训练器
    trainer = ModelTrainer()
    print("模型训练器初始化完成")