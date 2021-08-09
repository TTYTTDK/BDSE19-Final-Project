
from glob import glob
import pandas as pd

files = glob("D:/BDSE19-Final-Project/Crawl/data/Shipping*.csv")
ship_2603 = pd.read_csv('C:/Users/user/Downloads/Stock_TW_2603.TW.csv')

# DataFrame List (string)
index=[]
df=[]
for f in files:
    f1 = f.replace(".", "_").split("_")
    index.append(str(f1[1]))
    df.append(pd.read_csv(f))

# Merge Index Data &  Modified Columns Name
for i in range(len(index)):
    newName = df[i].rename(columns={'DATADATE':'Date','VALUE':index[i]})
    
 # 各指數分別存   
    merge = pd.merge(ship_2603, newName, how='left').interpolate()
    Newdf = merge.iloc[:,[0,-1]].to_csv(f'DateAdj_ShippingIndex_{index[i]}.csv')
    
    i+=1
    
"""    
### 與航運股合併
    if i<1:
        ship_merge = pd.merge(ship_2603,newName, how='left')
    ship_merge = pd.merge(ship_merge,newName, how='left')
    print(ship_merge)    
    i+=1 
    
# Fill NAN with interpolate()
Ship_Merge = ship_merge.interpolate()

# Save File as .csv
Ship_Merge.to_csv("ship_index_merge.csv")
"""