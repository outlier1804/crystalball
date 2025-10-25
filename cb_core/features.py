# cb_core/features.py
import pandas as pd
import numpy as np
import ta
from cb_core.regimes import add_regime_features

def add_tech_indicators(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    df["rsi_14"] = ta.momentum.rsi(df["Close"], window=14)
    macd = ta.trend.MACD(df["Close"])
    df["macd"] = macd.macd()
    df["macd_signal"] = macd.macd_signal()
    df["atr_14"] = ta.volatility.average_true_range(df["High"], df["Low"], df["Close"], 14)
    bb = ta.volatility.BollingerBands(df["Close"], window=20, window_dev=2)
    df["bb_pct"] = (df["Close"] - bb.bollinger_lband()) / (bb.bollinger_hband() - bb.bollinger_lband())
    df["ret_1d"] = df["Close"].pct_change()
    df["rv_10"] = df["ret_1d"].rolling(10).std() * np.sqrt(252)
    # VWAP distance proxy (intraday requires intraday data)
    df["hl_range"] = (df["High"] - df["Low"]) / df["Close"]
    
    # Add regime features
    df = add_regime_features(df) # New line
    
    return df.dropna()
