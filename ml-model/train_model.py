import os
import joblib
import numpy as np
import pandas as pd

from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, roc_auc_score
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from xgboost import XGBClassifier

# ------------ CONFIG ------------ #

DATA_PATH = "cleaned/nhanes_diabetes_clean.csv"
MODEL_DIR = "models"
MODEL_PATH = os.path.join(MODEL_DIR, "nhanes_diabetes_xgb.pkl")

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


# ------------ LOAD DATA ------------ #

def load_data():
    if not os.path.exists(DATA_PATH):
        raise FileNotFoundError(f"Could not find dataset at {DATA_PATH}")

    df = pd.read_csv(DATA_PATH)

    # Basic sanity check
    missing_cols = [c for c in FEATURE_COLUMNS + [TARGET_COLUMN] if c not in df.columns]
    if missing_cols:
        raise ValueError(f"Missing columns in CSV: {missing_cols}")

    X = df[FEATURE_COLUMNS]
    y = df[TARGET_COLUMN].astype(int)

    return X, y


# ------------ BUILD PIPELINE ------------ #

def build_model_pipeline():
    # Impute missing numeric values with median
    numeric_transformer = Pipeline(steps=[
        ("imputer", SimpleImputer(strategy="median")),
    ])

    preprocessor = ColumnTransformer(
        transformers=[
            ("num", numeric_transformer, FEATURE_COLUMNS),
        ]
    )

    # XGBoost classifier
    clf = XGBClassifier(
        n_estimators=300,
        max_depth=4,
        learning_rate=0.05,
        subsample=0.8,
        colsample_bytree=0.8,
        eval_metric="logloss",
        random_state=42,
        n_jobs=-1,
        scale_pos_weight=3.0,  # helps with class imbalance (~17% positives)
    )

    model = Pipeline(steps=[
        ("preprocess", preprocessor),
        ("clf", clf),
    ])

    return model


# ------------ TRAIN & EVALUATE ------------ #

def main():
    print(" Loading data...")
    X, y = load_data()

    print(f"Dataset shape: {X.shape}")
    print("Class balance (0 = no diabetes, 1 = diabetes):")
    unique, counts = np.unique(y, return_counts=True)
    print(dict(zip(unique, counts)))

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.2,
        random_state=42,
        stratify=y,
    )

    print(f"\nTrain shape: {X_train.shape}, Test shape: {X_test.shape}")

    print("\n Building model pipeline...")
    model = build_model_pipeline()

    print("\n Training XGBoost model...")
    model.fit(X_train, y_train)

    print("\n Evaluating on test set...")
    y_pred = model.predict(X_test)
    y_proba = model.predict_proba(X_test)[:, 1]

    print("\nClassification report:")
    print(classification_report(y_test, y_pred, digits=4))

    try:
        auc = roc_auc_score(y_test, y_proba)
        print(f"ROC-AUC: {auc:.4f}")
    except Exception as e:
        print(f"Could not compute ROC-AUC: {e}")

    # Save model
    os.makedirs(MODEL_DIR, exist_ok=True)
    joblib.dump(
        {
            "pipeline": model,
            "features": FEATURE_COLUMNS,
            "target": TARGET_COLUMN,
        },
        MODEL_PATH
    )

    print(f"\n Model saved to: {MODEL_PATH}")
    print(" Training complete.")


if __name__ == "__main__":
    main()
