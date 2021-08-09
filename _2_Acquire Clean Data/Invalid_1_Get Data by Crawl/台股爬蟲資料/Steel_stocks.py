import yfinance as yf
import requests
import pandas as pd

# 抓取股票資料
stocks = ['2002.TW', '2014.TW', '2027.TW', '2031.TW', '2023.TW',
          '2038.TW', '2006.TW', '2010.TW', '2028.TW', '2030.TW']
for stock in stocks:
    data = yf.Ticker(stock)
    df = data.history(period='1d', start='2010-1-1', end='2021-7-01')
    print(stock, df)
    df.to_csv(f'Stock_TW_{stock}.csv')
