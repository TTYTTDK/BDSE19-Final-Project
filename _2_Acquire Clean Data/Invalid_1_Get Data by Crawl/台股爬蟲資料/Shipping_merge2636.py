
from glob import glob
import pandas as pd

files = pd.read_csv('./Stock_TW_2636.TW.csv')
ship_2603 = pd.read_csv('./Stock_TW_2603.TW.csv')


merge = pd.merge(files.iloc[:, :6], ship_2603.iloc[:, :1],
                 how='right', on='Date').interpolate()
Newdf = merge.to_csv(f'DateAdj_Stock_TW_2636.TW.csv')
print(merge.shape)
