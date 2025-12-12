import os
import pandas as pd

# Folder where your P_*.xpt files are located
DATA_DIR = "nhanes_raw"

# Mapping of your actual NHANES files
FILES = {
    "DEMO": "P_DEMO.xpt",     # Demographics
    "BMX": "P_BMX.xpt",       # Body measures
    "BPX": "P_BPXO.xpt",      # Blood pressure
    "GLU": "P_GLU.xpt",       # Glucose
    "GHB": "P_GHB.xpt",       # HbA1c
    "TCHOL": "P_TCHOL.xpt",   # Cholesterol
    "DIQ": "P_DIQ.xpt",       # Diabetes questionnaire
}

# Correct columns for the P_ cycle
COLS = {
    "DEMO": ["SEQN", "RIDAGEYR"],          # Age
    "BMX": ["SEQN", "BMXBMI"],             # BMI
    "BPX": ["SEQN", "BPXOSY1", "BPXODI1"], # First systolic/diastolic readings
    "GLU": ["SEQN", "LBXGLU"],             # Glucose
    "GHB": ["SEQN", "LBXGH"],              # HbA1c
    "TCHOL": ["SEQN", "LBXTC"],            # Cholesterol
    "DIQ": ["SEQN", "DIQ010"],             # Diabetes label
}

def load_xpt(label):
    file_path = os.path.join(DATA_DIR, FILES[label])
    print(f"Loading {FILES[label]} ...")
    df = pd.read_sas(file_path)
    return df[COLS[label]]

def main():
    print("\n📥 Loading NHANES P_*.xpt files...\n")

    merged = None

    # Merge files on SEQN
    for label in FILES:
        df = load_xpt(label)
        if merged is None:
            merged = df
        else:
            merged = pd.merge(merged, df, on="SEQN", how="left")

    print("\n🔄 Renaming columns...")
    merged = merged.rename(columns={
        "RIDAGEYR": "age",
        "BMXBMI": "bmi",
        "BPXOSY1": "systolic_bp",
        "BPXODI1": "diastolic_bp",
        "LBXGLU": "glucose",
        "LBXGH": "hba1c",
        "LBXTC": "cholesterol",
        "DIQ010": "diabetes_label",
    })

    print("\n🧼 Cleaning data...")

    # Keep only rows with diabetes label
    merged = merged[merged["diabetes_label"].notna()]

    # Convert diabetes label to binary
    # 1 = Yes diabetes
    # 3 = Borderline → treat as prediabetes
    # 2 = No diabetes
    merged["diabetes"] = merged["diabetes_label"].apply(
        lambda x: 1 if x in [1, 3] else 0
    )

    merged.drop(columns=["diabetes_label"], inplace=True)

    # Optional filtering (remove impossible ages)
    merged = merged[(merged["age"] >= 18) & (merged["age"] <= 80)]

    print("\n💾 Saving cleaned dataset...")
    os.makedirs("cleaned", exist_ok=True)
    merged.to_csv("cleaned/nhanes_diabetes_clean.csv", index=False)

    print("\n✅ File saved: cleaned/nhanes_diabetes_clean.csv")
    print(f"Rows: {merged.shape[0]}, Columns: {merged.shape[1]}")

if __name__ == "__main__":
    main()
