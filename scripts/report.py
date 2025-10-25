import pandas as pd
import os
import yaml
from datetime import datetime
import plotly.graph_objects as go
from plotly.offline import plot

# Load configurations
def load_config(file_path):
    with open(file_path, 'r') as f:
        return yaml.safe_load(f)

CONFIG_DIR = "config"
DATA_RAW_DIR = "data/raw"
REPORTS_DIR = "reports" # New directory for reports
os.makedirs(REPORTS_DIR, exist_ok=True)

symbols_config = load_config(os.path.join(CONFIG_DIR, "symbols.yml"))
WATCHLIST = symbols_config["default_watchlist"]

def generate_html_report(ticker: str):
    print(f"Generating HTML report for {ticker}...")

    # Load backtest stats
    stats_path = os.path.join(DATA_RAW_DIR, f"{ticker}_backtest_stats.txt")
    stats_content = "Backtest stats not found."
    if os.path.exists(stats_path):
        with open(stats_path, "r") as f:
            stats_content = f.read()

    # Load portfolio value
    pf_value_path = os.path.join(DATA_RAW_DIR, f"{ticker}_portfolio_value.csv")
    portfolio_value_df = pd.DataFrame()
    if os.path.exists(pf_value_path):
        portfolio_value_df = pd.read_csv(pf_value_path, parse_dates=["Date"]).set_index("Date").sort_index()

    # Create Plotly chart for portfolio value
    fig = go.Figure()
    if not portfolio_value_df.empty:
        fig.add_trace(go.Scatter(x=portfolio_value_df.index, y=portfolio_value_df["value"], mode='lines', name='Portfolio Value'))
        fig.update_layout(title=f'{ticker} Portfolio Value',
                          xaxis_title='Date',
                          yaxis_title='Value ($)',
                          hovermode="x unified")
    
    portfolio_value_plot_div = plot(fig, output_type='div', include_plotlyjs=False)

    # HTML Report Template
    html_template = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <title>CrystalBall Report - {ticker}</title>
        <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
        <style>
            body {{ font-family: Arial, sans-serif; margin: 20px; }}
            h1 {{ color: #333; }}
            h2 {{ color: #555; border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-top: 30px; }}
            pre {{ background-color: #f4f4f4; padding: 15px; border-radius: 5px; overflow-x: auto; }}
            .chart-container {{ margin-top: 20px; }}
        </style>
    </head>
    <body>
        <h1>CrystalBall Trading Report - {ticker}</h1>

        <h2>Backtest Statistics</h2>
        <pre>{stats_content}</pre>

        <h2>Portfolio Value</h2>
        <div class="chart-container">
            {portfolio_value_plot_div}
        </div>

        <p>Report generated on: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}</p>
    </body>
    </html>
    """

    report_path = os.path.join(REPORTS_DIR, f"{ticker}_report.html")
    with open(report_path, "w") as f:
        f.write(html_template)
    print(f"HTML report generated at {report_path}")

if __name__ == "__main__":
    # Ensure run_pipeline.py has been executed to generate necessary data
    for ticker in WATCHLIST:
        generate_html_report(ticker)
