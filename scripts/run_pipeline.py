import pandas as pd
import yfinance as yf
import yaml
import os
from datetime import datetime, timedelta

from cb_core.features import add_tech_indicators
from cb_core.labels import horizon_label
from cb_core.models import train_lgbm, save_model
from cb_core.backtest import run_backtest

# Load configurations
def load_config(file_path):
    with open(file_path, 'r') as f:
        return yaml.safe_load(f)

# Paths
CONFIG_DIR = "config"
DATA_RAW_DIR = "data/raw"
DATA_MODELS_DIR = "data/models"
os.makedirs(DATA_RAW_DIR, exist_ok=True)
os.makedirs(DATA_MODELS_DIR, exist_ok=True)

symbols_config = load_config(os.path.join(CONFIG_DIR, "symbols.yml"))
model_config = load_config(os.path.join(CONFIG_DIR, "model.yml"))

WATCHLIST = symbols_config["default_watchlist"]
HORIZONS = model_config["horizons"]
LGBM_PARAMS = model_config["lightgbm_params"]
BACKTEST_PARAMS = model_config["backtest_params"]

def download_data(ticker, start_date, end_date):
    print(f"Downloading {ticker} data from {start_date} to {end_date}...")
    df = yf.download(ticker, start=start_date, end=end_date)
    return df

def run_pipeline(ticker):
    print(f"Running pipeline for {ticker}...")
    end_date = datetime.now()
    start_date = end_date - timedelta(days=365 * 5) # 5 years of data

    df = download_data(ticker, start_date, end_date)
    if df.empty:
        print(f"No data downloaded for {ticker}. Skipping.")
        return

    # Add technical indicators
    df_features = add_tech_indicators(df.copy())

    # Generate labels for each horizon
    all_labels = {}
    for h in HORIZONS:
        df_features[f"label_{h}d"] = horizon_label(df_features, h)
        all_labels[f"label_{h}d"] = df_features[f"label_{h}d"]

    # Prepare data for model training
    feature_columns = [col for col in df_features.columns if col not in ["Open", "High", "Low", "Close", "Adj Close", "Volume"] and not col.startswith("label_")]
    X = df_features[feature_columns].dropna()

    # Train models for each horizon
    predictions = pd.DataFrame(index=X.index)
    predictions["Close"] = df_features["Close"] # Add Close price for backtest

    for h in HORIZONS:
        print(f"Training model for {h}-day horizon...")
        y = all_labels[f"label_{h}d"].loc[X.index] # Align labels with features
        
        # Ensure X and y have the same index and are aligned
        common_index = X.index.intersection(y.index)
        X_aligned = X.loc[common_index]
        y_aligned = y.loc[common_index]

        if X_aligned.empty or y_aligned.empty:
            print(f"Not enough data to train for {h}-day horizon after alignment. Skipping.")
            continue

        model, auc = train_lgbm(X_aligned, y_aligned, lgbm_params=LGBM_PARAMS)
        print(f"Model for {h}-day horizon trained with AUC: {auc:.4f}")

        model_path = os.path.join(DATA_MODELS_DIR, f"{ticker}_lgbm_h{h}d.joblib")
        save_model(model, model_path)
        print(f"Model saved to {model_path}")

        # Predict probabilities
        # Ensure prediction features are aligned with training features
        X_predict = df_features[feature_columns].loc[df_features.index.isin(X.index)]
        if not X_predict.empty:
            predictions[f"Prob_{h}d"] = model.predict_proba(X_predict)[:, 1]
        else:
            predictions[f"Prob_{h}d"] = pd.Series(index=df_features.index) # Empty series if no data

    # After predictions are generated for all horizons
    # For simplicity, let's use the probability from the longest horizon for backtesting
    # In a real scenario, you might combine probabilities or choose based on strategy
    if f"Prob_{HORIZONS[-1]}d" in predictions.columns:
        print(f"Running backtest for {ticker} using {HORIZONS[-1]}-day probabilities...")
        backtest_prob = predictions[f"Prob_{HORIZONS[-1]}d"].dropna()
        
        # Align close prices with the backtest probabilities
        close_prices = df["Close"].loc[backtest_prob.index]

        if not close_prices.empty and not backtest_prob.empty:
            stats, pf = run_backtest(close_prices, backtest_prob, **BACKTEST_PARAMS)
            print(f"Backtest stats for {ticker}:\n{stats}")

            # Save backtest stats to a file
            stats_path = os.path.join(DATA_RAW_DIR, f"{ticker}_backtest_stats.txt")
            with open(stats_path, "w") as f:
                f.write(str(stats))
            print(f"Backtest stats saved to {stats_path}")

            # Optionally, save the portfolio object or its value for dashboard
            pf_value_path = os.path.join(DATA_RAW_DIR, f"{ticker}_portfolio_value.csv")
            pf.value().to_csv(pf_value_path, header=True, index_label="Date")
            print(f"Portfolio value saved to {pf_value_path}")

            # Save combined weights (signals) for dashboard
            signals_path = os.path.join(DATA_RAW_DIR, f"{ticker}_signals.csv")
            pf.target_weights.to_csv(signals_path, header=True, index_label="Date")
            print(f"Signals (combined weights) saved to {signals_path}")
        else:
            print(f"Not enough data to run backtest for {ticker}.")
    else:
        print(f"No {HORIZONS[-1]}-day probabilities found for backtesting {ticker}.")

    # Output CSV for dashboard/backtest
    output_csv_path = os.path.join(DATA_RAW_DIR, f"{ticker}_predictions.csv")
    predictions.to_csv(output_csv_path, index_label="Date")
    print(f"Predictions saved to {output_csv_path}")

if __name__ == "__main__":
    for ticker in WATCHLIST:
        run_pipeline(ticker)
