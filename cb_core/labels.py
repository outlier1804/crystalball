# cb_core/labels.py
import pandas as pd

def horizon_label(df: pd.DataFrame, horizon_days: int, fee_bp: float = 2.0) -> pd.Series:
    """
    Binary label: 1 if forward return over 'horizon_days' exceeds cost threshold.
    fee_bp: round-trip cost in basis points (e.g., 2bp = 0.02%)
    """
    fwd = df["Close"].shift(-horizon_days) / df["Close"] - 1.0
    threshold = fee_bp / 10000.0
    return (fwd > threshold).astype(int)
