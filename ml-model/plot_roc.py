import joblib
import pandas as pd
from sklearn.metrics import roc_curve, roc_auc_score
import matplotlib.pyplot as plt

MODEL_PATH = "models/nhanes_diabetes_xgb.pkl"
DATA_PATH = "cleaned/nhanes_diabetes_clean.csv"

# Load data
df = pd.read_csv(DATA_PATH)

FEATURE_COLUMNS = [
    "age", "bmi", "systolic_bp", "diastolic_bp",
    "glucose", "hba1c", "cholesterol"
]

X = df[FEATURE_COLUMNS]
y = df["diabetes"].astype(int)

# Load model pipeline
bundle = joblib.load(MODEL_PATH)
model = bundle["pipeline"]

# Predict probabilities
y_proba = model.predict_proba(X)[:, 1]

# Compute ROC
fpr, tpr, _ = roc_curve(y, y_proba)
auc = roc_auc_score(y, y_proba)

# Plot
plt.figure(figsize=(7, 6))
plt.plot(fpr, tpr, label=f"ROC Curve (AUC = {auc:.3f})", linewidth=2)
plt.plot([0, 1], [0, 1], linestyle="--", color="gray")

plt.title("ROC Curve – NHANES Diabetes Classifier", fontsize=14)
plt.xlabel("False Positive Rate")
plt.ylabel("True Positive Rate")
plt.legend(loc="lower right")
plt.grid(alpha=0.3)

plt.savefig("roc_curve.png", dpi=300, bbox_inches="tight")
plt.close()

print("ROC curve saved as roc_curve.png")
