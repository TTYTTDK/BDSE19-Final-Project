# -*- coding: utf-8 -*-

import pandas as pd

# 匯入長表
df = pd.read_csv('C:/Users/user/Desktop/dataset/long_dataframe.csv')

# 瀏覽長表
df.index
df.info()

# -- 未設定 Index 的取值方法
idf = df[df['category']=='Steel']
idf[idf['name']=='2002.TW']

# -- 設定 mutiIndex & 取值方法 --
df.set_index(['category','name'], inplace=True)

df.loc['Steel']
df.loc[('Steel','2002.TW'),:'dayofyear']
