import numpy as np
import pandas as pd
from hmmlearn import hmm

def fit_hmm_model(data: pd.DataFrame, n_components: int = 3, n_iter: int = 100, random_state: int = 42):
    """
    Fits a Gaussian HMM model to the input data.

    Args:
        data (pd.DataFrame): Input data for HMM, typically returns and volatility.
        n_components (int): Number of hidden states (regimes).
        n_iter (int): Number of iterations for EM algorithm.
        random_state (int): Random state for reproducibility.

    Returns:
        hmm.GaussianHMM: Fitted HMM model.
    """
    model = hmm.GaussianHMM(n_components=n_components, covariance_type="full", n_iter=n_iter, random_state=random_state)
    model.fit(data)
    return model

def predict_regimes(model: hmm.GaussianHMM, data: pd.DataFrame) -> pd.Series:
    """
    Predicts the hidden states (regimes) using a fitted HMM model.

    Args:
        model (hmm.GaussianHMM): Fitted HMM model.
        data (pd.DataFrame): Input data for prediction.

    Returns:
        pd.Series: Predicted hidden states (regimes).
    """
    return pd.Series(model.predict(data), index=data.index)

def add_regime_features(df: pd.DataFrame, returns_col: str = "ret_1d", vol_col: str = "rv_10", n_components: int = 3) -> pd.DataFrame:
    """
    Adds regime features to the DataFrame using HMM.

    Args:
        df (pd.DataFrame): Input DataFrame with returns and volatility.
        returns_col (str): Name of the returns column.
        vol_col (str): Name of the volatility column.
        n_components (int): Number of hidden states for HMM.

    Returns:
        pd.DataFrame: DataFrame with added 'regime' column.
    """
    df_copy = df.copy()
    
    # Ensure returns and volatility columns exist
    if returns_col not in df_copy.columns or vol_col not in df_copy.columns:
        raise ValueError(f"DataFrame must contain '{returns_col}' and '{vol_col}' columns.")

    # Prepare data for HMM
    hmm_data = df_copy[[returns_col, vol_col]].dropna()
    
    if hmm_data.empty or len(hmm_data) < n_components:
        df_copy['regime'] = np.nan
        return df_copy

    # Fit and predict HMM
    model = fit_hmm_model(hmm_data, n_components=n_components)
    df_copy.loc[hmm_data.index, 'regime'] = predict_regimes(model, hmm_data)
    
    return df_copy
