import pandas as pd

df = pd.read_sas("nhanes_raw/P_BPXO.xpt")
print(df.columns.tolist())
