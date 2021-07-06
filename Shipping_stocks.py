import yfinance as yf
import requests
import pandas as pd

# 抓取股票資料
stocks = ['2603.TW', '2609.TW', '2615.TW', '2637.TW', '2606.TW',
          '5608.TW', '2605.TW', '2617.TW', '2636.TW', '5609.TW']
#df = pd.DataFrame()
for stock in stocks:
    data = yf.Ticker(stock)
    df = data.history(period='1d', start='2010-1-1', end='2021-6-30')
    print(stock, df)
    df.to_csv(f'Stock_TW_{stock}.csv')
#

