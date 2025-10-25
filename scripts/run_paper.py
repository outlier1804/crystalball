import pandas as pd
import os
import yaml
from datetime import datetime
from cb_core.exec_alpaca import AlpacaExecutor
from alpaca.trading.enums import OrderSide

# Load configurations
def load_config(file_path):
    with open(file_path, 'r') as f:
        return yaml.safe_load(f)

CONFIG_DIR = "config"
DATA_RAW_DIR = "data/raw"

symbols_config = load_config(os.path.join(CONFIG_DIR, "symbols.yml"))
model_config = load_config(os.path.join(CONFIG_DIR, "model.yml"))

WATCHLIST = symbols_config["default_watchlist"]
HORIZONS = model_config["horizons"]
BACKTEST_PARAMS = model_config["backtest_params"]

def run_paper_trading(ticker: str):
    print(f"Running paper trading for {ticker}...")
    executor = AlpacaExecutor()
    account = executor.get_account()
    print(f"Account status: {account.status}, Equity: {account.equity}")

    # Load the latest signals
    signals_path = os.path.join(DATA_RAW_DIR, f"{ticker}_signals.csv")
    if not os.path.exists(signals_path):
        print(f"Signals file not found for {ticker}. Please run run_pipeline.py first.")
        return

    signals_df = pd.read_csv(signals_path, parse_dates=["Date"]).set_index("Date").sort_index()

    # Get the latest signal
    latest_signal_date = signals_df.index[-1]
    latest_signal = signals_df.loc[latest_signal_date, "target_weights"] # Assuming 'target_weights' is the column name

    print(f"Latest signal for {ticker} on {latest_signal_date}: {latest_signal}")

    # Simple trading logic:
    # If latest_signal > 0, buy (or increase position)
    # If latest_signal <= 0, sell (or decrease position)

    # For simplicity, let's assume we want to target a certain percentage of equity
    # This needs to be refined with actual position sizing logic and risk management
    equity = float(account.equity)
    target_position_value = equity * latest_signal # This is a simplified target

    # Get current price (using yfinance for simplicity, in real-time use Alpaca's market data)
    # This is a placeholder for getting the current price
    # In a real scenario, you would use Alpaca's market data API
    try:
        import yfinance as yf
        current_price = yf.Ticker(ticker).history(period="1d")["Close"].iloc[-1]
    except Exception as e:
        print(f"Could not get current price for {ticker} using yfinance: {e}. Skipping trade.")
        return

    if current_price == 0:
        print(f"Current price for {ticker} is 0. Skipping trade.")
        return

    # Calculate target quantity
    target_qty = target_position_value / current_price
    
    # Get current open positions
    open_positions = executor.get_open_positions()
    current_qty = 0
    for p in open_positions:
        if p.symbol == ticker:
            current_qty = float(p.qty)
            break

    qty_to_trade = target_qty - current_qty

    if qty_to_trade > 0.01: # Buy
        print(f"Placing BUY order for {ticker}: {qty_to_trade:.2f} shares")
        try:
            # For simplicity, using market order. Bracket orders would require limit/stop/take-profit prices.
            order = executor.place_market_order(ticker, qty_to_trade, OrderSide.BUY)
            print(f"Order placed: {order.id}, Status: {order.status}")
        except Exception as e:
            print(f"Error placing BUY order: {e}")
    elif qty_to_trade < -0.01: # Sell
        print(f"Placing SELL order for {ticker}: {abs(qty_to_trade):.2f} shares")
        try:
            order = executor.place_market_order(ticker, abs(qty_to_trade), OrderSide.SELL)
            print(f"Order placed: {order.id}, Status: {order.status}")
        except Exception as e:
            print(f"Error placing SELL order: {e}")
    else:
        print(f"No significant trade needed for {ticker}. Current qty: {current_qty:.2f}, Target qty: {target_qty:.2f}")

if __name__ == "__main__":
    # Ensure .env file is configured with APCA_API_KEY_ID, APCA_API_SECRET_KEY, APCA_PAPER=true
    # And run_pipeline.py has been executed to generate signals
    for ticker in WATCHLIST:
        run_paper_trading(ticker)
