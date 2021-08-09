import yfinance as yf
import requests
import pandas as pd

stocks = ['1314.TW', '1301.TW', '1304.TW', '1303.TW', '1312.TW',
          '1313.TW', '1308.TW', '1305.TW', '1326.TW', '1309.TW']
for stock in stocks:
    data = yf.Ticker(stock)
    df = data.history(period='1d', start='2010-1-1', end='2021-7-01')
    print(stock, df)
    df.to_csv(f'Stock_TW_{stock}.csv')
