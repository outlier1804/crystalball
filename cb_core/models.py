# cb_core/models.py
import pandas as pd
import lightgbm as lgb
from sklearn.model_selection import TimeSeriesSplit
from sklearn.metrics import roc_auc_score
import joblib

def train_lgbm(X: pd.DataFrame, y: pd.Series, n_splits: int = 5, seed: int = 42, lgbm_params: dict = None):
    tscv = TimeSeriesSplit(n_splits=n_splits)
    aucs = []
    best_model = None
    best_auc = -1
    for tr_idx, va_idx in tscv.split(X):
        X_tr, X_va = X.iloc[tr_idx], X.iloc[va_idx]
        y_tr, y_va = y.iloc[tr_idx], y.iloc[va_idx]
        
        model_params = lgbm_params if lgbm_params is not None else {}
        model_params['random_state'] = seed # Ensure random_state is set
        
        model = lgb.LGBMClassifier(
            **model_params
        )
        model.fit(X_tr, y_tr)
        p = model.predict_proba(X_va)[:,1]
        auc = roc_auc_score(y_va, p)
        if auc > best_auc:
            best_auc = auc
            best_model = model
        aucs.append(auc)
    return best_model, float(sum(aucs)/len(aucs))

def save_model(model, path: str):
    joblib.dump(model, path)
