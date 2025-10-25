import pandas as pd
import numpy as np

def volatility_targeting(returns: pd.Series, target_vol: float = 0.10, lookback_window: int = 20) -> pd.Series:
    """
    Calculates position size based on volatility targeting.
    Scales positions such that the portfolio's realized volatility matches a target volatility.

    Args:
        returns (pd.Series): Series of daily returns.
        target_vol (float): Annualized target volatility (e.g., 0.10 for 10%).
        lookback_window (int): Lookback window for calculating historical volatility.

    Returns:
        pd.Series: Position weights (leverage) based on volatility targeting.
    """
    annualization_factor = np.sqrt(252) # Assuming daily returns
    
    # Calculate historical volatility
    historical_vol = returns.rolling(window=lookback_window).std() * annualization_factor
    
    # Calculate volatility-targeted weights
    # If historical_vol is 0, avoid division by zero by setting weight to 0
    weights = target_vol / historical_vol.replace(0, np.nan)
    
    return weights.replace([np.inf, -np.inf], np.nan).fillna(0)

def confidence_scaling(probabilities: pd.Series, p0: float = 0.55, max_w: float = 1.0) -> pd.Series:
    """
    Scales position size based on model confidence (probability).

    Args:
        probabilities (pd.Series): Series of model probabilities (e.g., probability of up-move).
        p0 (float): Threshold probability above which position starts to scale up.
        max_w (float): Maximum position weight.

    Returns:
        pd.Series: Scaled position weights based on confidence.
    """
    # position scales from 0 at 0.5 to max_w at >= p0
    edge = (probabilities - 0.5) / (p0 - 0.5)
    return np.clip(edge, 0, 1) * max_w

def combine_position_sizing(vol_weights: pd.Series, conf_weights: pd.Series) -> pd.Series:
    """
    Combines volatility-targeted weights and confidence-scaled weights.

    Args:
        vol_weights (pd.Series): Weights from volatility targeting.
        conf_weights (pd.Series): Weights from confidence scaling.

    Returns:
        pd.Series: Combined position weights.
    """
    # Element-wise multiplication to combine the two sizing methods
    # This means if either is zero, the combined weight will be zero
    combined_weights = vol_weights * conf_weights
    return combined_weights
