# cb_core/backtest.py
import numpy as np
import pandas as pd
import vectorbt as vbt
from cb_core.position import volatility_targeting, confidence_scaling, combine_position_sizing

def run_backtest(close: pd.Series, prob: pd.Series, fee=0.0002, slippage=0.0001, target_vol: float = 0.10, p0: float = 0.55, max_w: float = 1.0):
    # Calculate returns for volatility targeting
    returns = close.pct_change().dropna()

    # Apply position sizing strategies
    vol_weights = volatility_targeting(returns, target_vol=target_vol)
    conf_weights = confidence_scaling(prob, p0=p0, max_w=max_w)

    # Align indices for combination
    common_index = vol_weights.index.intersection(conf_weights.index)
    vol_weights_aligned = vol_weights.loc[common_index]
    conf_weights_aligned = conf_weights.loc[common_index]

    # Combine weights
    combined_weights = combine_position_sizing(vol_weights_aligned, conf_weights_aligned)
    
    # Align close prices with combined weights
    close_aligned = close.loc[combined_weights.index]

    pf = vbt.Portfolio.from_signals(
        close_aligned, # Use aligned close prices
        entries=combined_weights > 0.0,
        exits=combined_weights <= 0.0,
        fees=fee,
        slippage=slippage,
        init_cash=100_000,
        size=np.nan,  # use weights below
        lock_cash=False,
        freq="1D",
        call_seq="auto",
        upon_opposite_entry="reverse",
        direction="both",
        # custom sizing
        size_type="targetpercent",
        target=combined_weights # Use combined weights
    )
    return pf.stats(), pf
