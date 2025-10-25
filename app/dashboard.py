# app/dashboard.py
import streamlit as st
import pandas as pd
import os

st.title("CrystalBall — Signals & Backtest")

st.header("Upload Data for Analysis")

uploaded_predictions_file = st.file_uploader("Upload Predictions CSV (e.g., SPY_predictions.csv)", type=["csv"])
uploaded_stats_file = st.file_uploader("Upload Backtest Stats TXT (e.g., SPY_backtest_stats.txt)", type=["txt"])
uploaded_portfolio_value_file = st.file_uploader("Upload Portfolio Value CSV (e.g., SPY_portfolio_value.csv)", type=["csv"])
uploaded_signals_file = st.file_uploader("Upload Signals CSV (e.g., SPY_signals.csv)", type=["csv"])

if uploaded_predictions_file and uploaded_stats_file and uploaded_portfolio_value_file and uploaded_signals_file:
    st.subheader("Predictions Data")
    predictions_df = pd.read_csv(uploaded_predictions_file, parse_dates=["Date"]).set_index("Date").sort_index()
    st.write(predictions_df.head())

    st.subheader("Backtest Statistics")
    stats_content = uploaded_stats_file.read().decode("utf-8")
    st.text(stats_content)

    st.subheader("Portfolio Value Over Time")
    portfolio_value_df = pd.read_csv(uploaded_portfolio_value_file, parse_dates=["Date"]).set_index("Date").sort_index()
    st.line_chart(portfolio_value_df)

    st.subheader("Trading Signals (Combined Weights)")
    signals_df = pd.read_csv(uploaded_signals_file, parse_dates=["Date"]).set_index("Date").sort_index()
    st.line_chart(signals_df)

    # Optional: Display probabilities for a selected horizon
    st.subheader("Probabilities")
    prob_cols = [col for col in predictions_df.columns if col.startswith("Prob_")]
    if prob_cols:
        selected_prob_col = st.selectbox("Select Probability Horizon to Display", prob_cols)
        st.line_chart(predictions_df[selected_prob_col])
    else:
        st.write("No probability columns found in predictions data.")

else:
    st.info("Please upload all required files to view the analysis.")
