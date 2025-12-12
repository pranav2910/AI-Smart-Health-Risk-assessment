import os
import joblib
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.metrics import ConfusionMatrixDisplay, confusion_matrix
from sklearn.model_selection import train_test_split

# ---------------- CONFIG ---------------- #

DATA_PATH = "cleaned/nhanes_diabetes_clean.csv"
MODEL_PATH = "models/nhanes_diabetes_xgb.pkl"

FEATURE_COLUMNS = [
    "age",
    "bmi",
    "systolic_bp",
    "diastolic_bp",
    "glucose",
    "hba1c",
    "cholesterol",
]

TARGET_COLUMN = "diabetes"

OUTPUT_IMAGE = "confusion_matrix.png"

# ---------------- LOAD MODEL ---------------- #

print("📥 Loading model...")
model_bundle = joblib.load(MODEL_PATH)
model = model_bundle["pipeline"]

print("📥 Loading dataset...")
df = pd.read_csv(DATA_PATH)

X = df[FEATURE_COLUMNS]
y = df[TARGET_COLUMN].astype(int)

# ---------------- RECREATE TRAIN/TEST SPLIT ---------------- #

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y
)

# ---------------- PREDICT ---------------- #

print("🔮 Generating predictions...")
y_pred = model.predict(X_test)

# ---------------- CONFUSION MATRIX ---------------- #

cm = confusion_matrix(y_test, y_pred)
disp = ConfusionMatrixDisplay(confusion_matrix=cm, display_labels=["No Diabetes", "Diabetes"])

plt.figure(figsize=(6, 5))
disp.plot(cmap="Blues", values_format='d')
plt.title("Confusion Matrix – NHANES Diabetes XGBoost Model")
plt.tight_layout()

# Save image
plt.savefig(OUTPUT_IMAGE, dpi=300)
print(f"✅ Confusion matrix saved as: {OUTPUT_IMAGE}")

plt.show()
