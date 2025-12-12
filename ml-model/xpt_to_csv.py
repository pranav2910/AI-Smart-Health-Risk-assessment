import os
import pandas as pd

INPUT_FILE = "nhanes_raw/P_BPXO.xpt"
OUTPUT_CSV = "converted/P_BPXO.csv"

os.makedirs("converted", exist_ok=True)

df = pd.read_sas(INPUT_FILE)
df.to_csv(OUTPUT_CSV, index=False)

print(f"✅ Saved CSV to: {OUTPUT_CSV}")
