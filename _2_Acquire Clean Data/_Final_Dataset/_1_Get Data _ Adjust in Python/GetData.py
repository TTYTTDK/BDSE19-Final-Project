# -*- coding: utf-8 -*-

# 載入相關套件
import yfinance as yf
from opendatatools import shippingindex,futures
import pandas as pd
import numpy as np
import talib
from talib import abstract


# 加入日期特徵值 6 個欄位 (year,month,date,dayofyear,dayofweek,weekofyear)
def addDate(df): 
    
    # 所有欄位名稱改為小寫
    df.columns = df.columns.str.lower()
    df = df.rename(columns={df.columns[0]:'date'})

    # 日期欄位由字串改為日期格式
    df['date'] = pd.to_datetime(df['date'])
    
    df['year'] = df['date'].dt.year
    df['month'] = df['date'].dt.month
    df['day'] = df['date'].dt.day
    df['dayofyear'] = df['date'].dt.dayofyear
    df['weekofyear'] = df['date'].dt.weekofyear
    df['dayofweek'] = df['date'].dt.dayofweek
    
    # 日期欄位由日期改回字串格式
    df['date'] = df['date'].dt.date.astype(str)
    
    return df

## ---------- Start 全部技術指標 ----------


# 1_TAlib (使用TAlib套件取得189個技術指標)
def TAlib(df):
    
    ta_list = talib.get_functions()

    for x in ta_list:

        try:

            # x 為技術指標的代碼，透過迴圈填入，再透過 eval 計算出 output
            output = eval('abstract.'+x+'(df)')

            # 如果輸出是一維資料，幫這個指標取名為 x 本身；多維資料則不需命名
            output.name = x.lower() if type(output) == pd.core.series.Series else None

            # 透過 merge 把輸出結果併入 df DataFrame
            df = pd.concat([df, output], axis=1)

        except:

            print(x)
            
    return df

# 2_乖離率
def BIAS(close, timeperiod=20):
    
    if isinstance(close,np.ndarray):
        
        pass
    
    else:
        
        close = np.array(close)
        
    MA = talib.MA(close,timeperiod=timeperiod)
    
    return (close-MA)/MA

# 3_移動平均平行線差指標 (參考 : https://github.com/jealous/stockstats/blob/master/stockstats.py)
def AMA(df):
    
    return talib.MA(talib.SMA(df['close'], timeperiod=10)-talib.SMA(df['close'], timeperiod=50),  timeperiod=10)

# 4_心理線指標 (參考 : https://www.codeleading.com/article/72563130863/ 有英文註解)
def PSY(priceData, period):
    
    difference = priceData[1:].values - priceData[:-1].values
    difference = np.append(0, difference)
    difference_dir = np.where(difference > 0, 1, 0)
    psy = np.zeros((len(priceData),))
    psy[:period] *= np.nan
    
    for i in range(period, len(priceData)):
        
        psy[i] = (difference_dir[i-period+1:i+1].sum()) / period
        
    return psy*100

# 5_區間震盪線
def DPO(close):
    
    p = talib.MA(close, timeperiod=11)
    p.shift()
    
    return close-p

# 6_十字過濾線指標
def VHF(close):
    
    LCP = talib.MIN(close, timeperiod=28)
    HCP = talib.MAX(close, timeperiod=28)
    NUM = HCP - LCP
    pre = close.copy()
    pre = pre.shift()
    DEN = abs(close-close.shift())
    DEN = talib.MA(DEN, timeperiod=28)*28
    
    return NUM.div(DEN)

# 7_相對活力指數
def RVI(df):
    
    close = df.close
    open = df.open
    high = df.high
    low = df.low
    
    X = close-open+2*(close.shift()-open.shift())+2*(close.shift(periods=2)-open.shift(periods=2))*(close.shift(periods=3)-open.shift(periods=3))/6
    Y = high-low+2*(high.shift()-low.shift())+2*(high.shift(periods=2)-low.shift(periods=2))*(high.shift(periods=3)-low.shift(periods=3))/6
    Z = talib.MA(X, timeperiod=10)*10
    D = talib.MA(Y, timeperiod=10)*10
    
    return Z/D

## ---------- End 全部技術指標 -----------

# 將上述全部技術指標 function 結合為 TI()
def TI(df):
    
    # 加入 TAlib 技術指標
    df = TAlib(df)
    
    # 加入 六個股票常用指標
    df = pd.concat([df, pd.DataFrame(BIAS(df['close'], 20), columns=['bias']).set_index(df.index),
                    pd.DataFrame(AMA(df), columns=['ama']),
                    pd.DataFrame(PSY(df['close'], 24), columns=['psy']).set_index(df.index),
                    pd.DataFrame(DPO(df['close']), columns=['dpo']),
                    pd.DataFrame(VHF(df['close']), columns=['vhf']),
                    pd.DataFrame(RVI(df), columns=['rvi'])], axis=1)
    return df


## ---------------- GET DATA --------------

    
# 研究標的 = 鋼鐵、航運、石油塑化，各類股交易量前10名的股票
steel_stocks_num = ['2002.TW', '2014.TW', '2027.TW', '2031.TW', '2023.TW',
                    '2038.TW', '2006.TW', '2010.TW', '2028.TW', '2030.TW']
shipping_stocks_num = ['2603.TW','2609.TW','2615.TW','2637.TW','2606.TW',
                       '5608.TW','2605.TW','2617.TW','2636.TW','5609.TWO'] 
petrolium_plastic_num = ['1314.TW','1301.TW','1304.TW','1303.TW','1312.TW',
                         '1313.TW','1308.TW','1305.TW','1326.TW','1309.TW']

# 特徵值 = 台股和3大美股指標
stockIndex_num = ['^TWII','^DJI','^GSPC','^IXIC']

# 特徵值 = 黃金期貨
futures_num = ['GC=F']

# 建立box來裝相關的所有資料集
data_steel_stock=[]
data_shipping_stock = []
data_pp_stock=[]
data_stockIndex = []
data_futures = []

# ----- 從 yahoo finance 抓取台股、各大指數以及黃金期貨的資料 -----

# stocks = 所有要從yahoo finance 取得資料的名單
stocks = steel_stocks_num + shipping_stocks_num\
         + petrolium_plastic_num + stockIndex_num + futures_num

for stock in stocks:
    
    data = yf.Ticker(stock)
    df = data.history(period='1d', start='2011-1-1', end='2021-7-01')
    
    # 移除'Dividends','Stock Splits' 欄位
    df = df.drop(['Dividends','Stock Splits'], axis=1)
    
    # 將Date由index轉欄位 & 加入日期特徵值欄位x6
    df = df.reset_index()
    df = addDate(df)

    # 新增欄位 = 股票名稱 ('name')
    df.insert(1,'name',[stock]*len(df.index)) 
    
    # 新增欄位 = 股票所屬類股 ('category') ; 並將資料存入相應的box
    if stock in steel_stocks_num:
        
        df.insert(1,'category',['Steel']*len(df.index))
        data_steel_stock.append(df)
        
    if stock in shipping_stocks_num:
        
        df.insert(1,'category',['Shipping']*len(df.index))
        data_shipping_stock.append(df)
        
    if stock in petrolium_plastic_num:
        
        df.insert(1,'category',['Plastic']*len(df.index))
        data_pp_stock.append(df)
        
    if stock in stockIndex_num:
        
        df.insert(1,'category',['Index']*len(df.index))
        data_stockIndex.append(df)
        
    if stock in futures_num:
        
        df.insert(1,'category',['Futures']*len(df.index))
        data_futures.append(df)
        
# ----- 使用 Open data tools 抓取海運指數的資料 *6 -----

# shippingIndex_list = 6個指數資料 ('BDI', 'BPI', 'BCI', 'BSI', 'BDTI', 'BCTI')
shippingIndex_list, msg = shippingindex.get_index_list()

# 指定某一航運股的日期為合併基準
df_shippingIndex = data_shipping_stock[0].iloc[:,:1]

for name in list(shippingIndex_list['index']): # ['BDI', 'BPI', 'BCI', 'BSI', 'BDTI', 'BCTI']

    df, msg = shippingindex.get_index_data(name)
    
    # 變更欄位名稱
    df = df.rename(columns={'DATADATE':'date','VALUE':name})    

    # 選取時間區段
    df = df[df['date'].between('2011-01-01', '2021-06-30')]
    
    # 變更日期格式 (xxxx-xx-xx)
    df['date'] = pd.to_datetime(df['date'])
    df['date'] = df['date'].dt.date.astype(str)
    
    # 合併 6個 指數為 1個 dataframe
    df_shippingIndex = pd.merge(df_shippingIndex, df, how='left')
    
# 新增欄位 = 航運指數名稱 和 所屬類別
df_shippingIndex.insert(1,'category',['Index']*len(df_shippingIndex.index))
df_shippingIndex.insert(2,'name',['shippingIndex']*len(df_shippingIndex.index)) 

# ----- 抓取鐵礦期貨 DalianIronOre 資料 -----

df_DalianIronOre, msg = futures.get_kline('1d','I0')
df_DalianIronOre = addDate(df_DalianIronOre)
df_DalianIronOre = df_DalianIronOre[df_DalianIronOre['date'].between('2011-01-01', '2021-06-30')]

# 查看資料型態，並將所有資料型態統一改為 float64
print(df_DalianIronOre.dtypes)

df_DalianIronOre['open'] = df_DalianIronOre['open'].astype('float64')
df_DalianIronOre['high'] = df_DalianIronOre['high'].astype('float64')
df_DalianIronOre['low'] = df_DalianIronOre['low'].astype('float64')
df_DalianIronOre['close'] = df_DalianIronOre['close'].astype('float64')
df_DalianIronOre['volume'] = df_DalianIronOre['volume'].astype('float64')

# 新增欄位 = 期貨名稱、所屬類別
df_DalianIronOre.insert(1,'name',['Iron']*len(df_DalianIronOre.index))
df_DalianIronOre.insert(1,'category',['Futures']*len(df_DalianIronOre.index))

# 將資料存入相應的box
data_futures.append(df_DalianIronOre)


# ----- 石油期貨-Brent oil .csv + TAlib -----

df_BrentOil = pd.read_csv('C:/Users/user/Downloads/Data for AllFeatsure (Talib and Date)/AF_Futures_NA_Brent Oil.csv')
df_BrentOil = df_BrentOil.iloc[:,:6]
df_BrentOil = addDate(df_BrentOil)

# # 新增欄位 = 石油名稱、所屬類別
df_BrentOil.insert(1,'name',['BrentOil']*len(df_BrentOil.index))
df_BrentOil.insert(1,'category',['Futures']*len(df_BrentOil.index))

# 查看資料型態是否為float64
print(df_BrentOil.dtypes)

# 將資料存入相應的box
data_futures.append(df_BrentOil)

# ----- 石油期貨-Crude oil .csv + TAlib -----

df_CrudeOil = pd.read_csv('C:/Users/user/Downloads/Data for AllFeatsure (Talib and Date)/AF_Futures_NA_Crude Oil.csv')
df_CrudeOil = df_CrudeOil.iloc[:,:6]
df_CrudeOil = addDate(df_CrudeOil)

# 新增欄位 = 石油名稱、所屬類別
df_CrudeOil.insert(1,'name',['CrudeOil']*len(df_CrudeOil.index))
df_CrudeOil.insert(1,'category',['Futures']*len(df_CrudeOil.index))

# 查看資料型態是否為float64
print(df_CrudeOil.dtypes)

# 將資料存入相應的box
data_futures.append(df_CrudeOil)

# ----- 從中央銀行 下載 (20110103-20210630 .csv) 美金匯率 -----

df_twd2usd = pd.read_csv('C:/Users/user/Downloads/ExchangeRate.csv')
df_twd2usd = df_twd2usd.rename(columns={'期間':'date','新台幣NTD/USD':'NTD/USD'})
df_twd2usd['date'] = df_twd2usd['date'].astype(str).apply(lambda x: '{}-{}-{}'.format(x[:4], x[4:6], x[6:8]))

# 新增欄位 = 石油名稱、所屬類別
df_twd2usd.insert(1,'name',['TWD/USD']*len(df_twd2usd.index))
df_twd2usd.insert(1,'category',['ExRate']*len(df_twd2usd.index))

# 查看資料型態是否為float64
print(df_twd2usd.info())


## ---------------- END GET DATA ------------------


## --------- 調整所有資料日期 & 填補缺值 -----------

# 找出各台股都沒有空值的日期，以統整表格 (2524x1)

adj_date = data_pp_stock[0].iloc[:,:1]
sum_data_stock = data_pp_stock + data_shipping_stock + data_steel_stock

for df in sum_data_stock:
    
    # 篩選出各台股有價格變動但無交易量的日期， 並刪除
    filt = df.loc[(df.volume==0)&(df.open!=df.close),['date','name']]
    print("失真: ", filt)
    df = df.drop(filt.index)
    
    # 各台股都沒有空值的日期
    adj_date = pd.merge(adj_date, df.iloc[:,:1], how='inner', on='date')


# 開始調整日期 30筆個股、各指數、期貨、匯率 
def adjDate(box):

    adj_box = []
    
    for df in box:
        
        df = pd.merge(adj_date,df, how='left')
        
        # 運用內插法、向前填補缺值
        df = df.interpolate()
        df = df.fillna(method='ffill')
        
        # 新增欄位 = 加入技術指標
        df = TI(df)
        
        # 將資料存入adj_box
        adj_box.append(df)
        
    return adj_box

data_pp_stock = adjDate(data_pp_stock)
data_shipping_stock = adjDate(data_shipping_stock)
data_steel_stock = adjDate(data_steel_stock)
data_stockIndex = adjDate(data_stockIndex)
data_futures = adjDate(data_futures)
df_twd2usd = pd.merge(adj_date, df_twd2usd, how='left').interpolate().fillna(method='ffill')
df_shippingIndex = pd.merge(adj_date, df_shippingIndex, how='left').interpolate().fillna(method='bfill')


## --------- END 調整所有資料日期 & 填補缺值 -----------


## ----------- 合併所有表格 --------------


total_df = data_steel_stock + data_shipping_stock + data_pp_stock + data_futures + data_stockIndex + [df_shippingIndex, df_twd2usd]

# 長表

# 取日期作為合併基準
merge_df = data_steel_stock[0].iloc[:1,:]

# 合併所有台股、股價指數、期貨
for df in total_df[:-2]:
    
    df.reset_index(drop=True)
    merge_df = pd.concat([merge_df,df])

# 合併航運指數、匯率
merge_dd = pd.concat([df_shippingIndex, df_twd2usd], axis=0, ignore_index=True)

# 合併所有
merge = pd.merge(merge_df, merge_dd, how='outer')

merge = merge.iloc[1:,:]
print(merge)

# 存檔 長表
merge.to_csv('long_dataframe.csv', index=False)



'''
# 寬表 : 欄位名稱=> oo_x , oo_y
merge_df = data_steel_stock[0].iloc[:,:1]#.reset_index(drop=True)
for df in total_df:
    merge_df = pd.merge(merge_df, df, how='left', on='date')


# 存寬表
merge_df.to_csv('wide_dataframe.csv', index=False)

'''




