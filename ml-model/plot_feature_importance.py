import joblib
import pandas as pd
import matplotlib.pyplot as plt

MODEL_PATH = "models/nhanes_diabetes_xgb.pkl"

# Load model bundle
bundle = joblib.load(MODEL_PATH)
pipeline = bundle["pipeline"]
model = pipeline.named_steps["clf"]

FEATURES = [
    "age", "bmi", "systolic_bp", "diastolic_bp",
    "glucose", "hba1c", "cholesterol"
]

# Get importance scores from XGBoost
importance = model.feature_importances_

# Sort
sorted_idx = importance.argsort()
sorted_features = [FEATURES[i] for i in sorted_idx]
sorted_importance = importance[sorted_idx]

# Plot
plt.figure(figsize=(7, 5))
plt.barh(sorted_features, sorted_importance, color="#1976D2")
plt.xlabel("Importance Score")
plt.title("Feature Importance – XGBoost Diabetes Model")

plt.grid(axis="x", alpha=0.3)

plt.savefig("feature_importance.png", dpi=300, bbox_inches="tight")
plt.close()

print("Feature importance diagram saved as feature_importance.png")
