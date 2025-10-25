import os
import yaml
from alpaca.trading.client import TradingClient
from alpaca.trading.requests import MarketOrderRequest, LimitOrderRequest, StopOrderRequest, TakeProfitRequest, StopLossRequest
from alpaca.trading.enums import OrderSide, TimeInForce, OrderClass

class AlpacaExecutor:
    def __init__(self, config_path="config/broker.yml"):
        self.config = self._load_config(config_path)
        self.api_key = os.environ.get("APCA_API_KEY_ID") or self.config["alpaca"]["key"]
        self.secret_key = os.environ.get("APCA_API_SECRET_KEY") or self.config["alpaca"]["secret"]
        self.paper_trading = os.environ.get("APCA_PAPER", "true").lower() == "true" or self.config["alpaca"]["paper"]

        if not self.api_key or not self.secret_key:
            raise ValueError("Alpaca API Key and Secret Key must be set in .env or broker.yml")

        self.trading_client = TradingClient(self.api_key, self.secret_key, paper=self.paper_trading)
        print(f"Alpaca Executor initialized. Paper trading: {self.paper_trading}")

    def _load_config(self, config_path):
        with open(config_path, 'r') as f:
            return yaml.safe_load(f)

    def get_account(self):
        return self.trading_client.get_account()

    def place_market_order(self, symbol: str, qty: float, side: OrderSide):
        market_order_data = MarketOrderRequest(
            symbol=symbol,
            qty=qty,
            side=side,
            time_in_force=TimeInForce.DAY
        )
        return self.trading_client.submit_order(market_order_data)

    def place_bracket_order(self, symbol: str, qty: float, side: OrderSide, limit_price: float, take_profit_price: float, stop_loss_price: float):
        bracket_order_data = LimitOrderRequest(
            symbol=symbol,
            qty=qty,
            side=side,
            time_in_force=TimeInForce.DAY,
            limit_price=limit_price,
            order_class=OrderClass.BRACKET,
            take_profit=TakeProfitRequest(limit_price=take_profit_price),
            stop_loss=StopLossRequest(stop_price=stop_loss_price)
        )
        return self.trading_client.submit_order(bracket_order_data)

    def close_all_positions(self):
        return self.trading_client.close_all_positions(cancel_orders=True)

    def get_open_positions(self):
        return self.trading_client.get_all_positions()

    def get_open_orders(self):
        return self.trading_client.get_orders()

if __name__ == "__main__":
    # Example usage (ensure .env or config/broker.yml is set up)
    executor = AlpacaExecutor()
    account = executor.get_account()
    print(f"Account status: {account.status}, Equity: {account.equity}")

    # Example: Place a market order (uncomment to test)
    # try:
    #     order = executor.place_market_order("AAPL", 1, OrderSide.BUY)
    #     print(f"Market order placed: {order.id}")
    # except Exception as e:
    #     print(f"Error placing market order: {e}")

    # Example: Place a bracket order (uncomment to test)
    # try:
    #     order = executor.place_bracket_order("MSFT", 1, OrderSide.BUY, 400.0, 405.0, 395.0)
    #     print(f"Bracket order placed: {order.id}")
    # except Exception as e:
    #     print(f"Error placing bracket order: {e}")

    # Example: Get open positions
    # positions = executor.get_open_positions()
    # for p in positions:
    #     print(f"Symbol: {p.symbol}, Qty: {p.qty}, Avg Entry Price: {p.avg_entry_price}")

    # Example: Close all positions (use with caution in live trading)
    # executor.close_all_positions()
    # print("All positions closed.")
