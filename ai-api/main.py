from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import numpy as np
import pandas as pd

def get_extended_interpretations(data):
    # 'data' is the dictionary of inputs (Age, BMI, BP, etc.)
    results = []
    
    # 1. Hypertension Status
    sbp = data.get('systolic_bp', 0)
    dbp = data.get('diastolic_bp', 0)
    if sbp >= 140 or dbp >= 90:
        results.append("Hypertension Status: High Risk (Stage 2)")
    elif sbp >= 130 or dbp >= 80:
        results.append("Hypertension Status: Elevated (Stage 1)")
    else:
        results.append("Hypertension Status: Normal")

    # 2. Metabolic Syndrome (3+ factors = High Risk)
    met_score = 0
    if data.get('bmi', 0) >= 30: met_score += 1
    if sbp >= 130 or dbp >= 85: met_score += 1
    if data.get('glucose', 0) >= 100: met_score += 1
    if data.get('cholesterol', 0) >= 200: met_score += 1
    
    results.append(f"Metabolic Syndrome: {'High Risk' if met_score >= 3 else 'Low Risk'}")

    # 3. Cardiovascular Risk
    age = data.get('age', 0)
    chol = data.get('cholesterol', 0)
    if age > 50 and (sbp >= 140 or chol >= 240):
        results.append("Cardiovascular Risk: High")
    else:
        results.append("Cardiovascular Risk: Normal")

    return results

# -------------------------------
# Load saved XGBoost ML pipeline
# -------------------------------
model_data = joblib.load("../ml-model/models/nhanes_diabetes_xgb.pkl")
model = model_data["pipeline"]
FEATURES = model_data["features"]

# -------------------------------
# FastAPI app
# -------------------------------
app = FastAPI(title="SmartDiab AI API", version="1.0")

# Enable CORS (React frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # change to frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------
# Input schema
# -------------------------------
class DiabetesInput(BaseModel):
    age: float
    bmi: float
    systolic_bp: float
    diastolic_bp: float
    glucose: float
    hba1c: float
    cholesterol: float

# -------------------------------
# Helper Functions
# -------------------------------

def interpret_clinical(glucose, hba1c):
    """Return clinical category for glucose & HbA1c"""
    gl, a1c = None, None

    # Glucose interpretation
    if glucose >= 126:
        gl = "Diabetic"
    elif 100 <= glucose <= 125:
        gl = "Prediabetic"
    else:
        gl = "Normal"

    # HbA1c interpretation
    if hba1c >= 6.5:
        a1c = "Diabetic"
    elif 5.7 <= hba1c < 6.5:
        a1c = "Prediabetic"
    else:
        a1c = "Normal"

    return gl, a1c


def risk_level(prob, glucose, hba1c):
    """Combine ML probability with medical rules"""

    # ML-based probability thresholds
    if prob < 0.33:
        ml_risk = "Low"
    elif prob < 0.66:
        ml_risk = "Moderate"
    else:
        ml_risk = "High"

    gl_status, a1c_status = interpret_clinical(glucose, hba1c)

    # Combine them for final risk category
    if gl_status == "Diabetic" or a1c_status == "Diabetic" or prob >= 0.66:
        final = "High Risk "
    elif gl_status == "Prediabetic" or a1c_status == "Prediabetic" or prob >= 0.33:
        final = "Moderate Risk"
    else:
        final = "Low Risk"

    return ml_risk, final, gl_status, a1c_status


def generate_recommendations(risk):
    """Return personalized lifestyle recommendations"""
    if "Low" in risk:
        return [
            "Maintain current lifestyle.",
            "Continue regular exercise (20–30 mins/day).",
            "Balanced diet with whole grains and vegetables.",
            "Monitor glucose yearly."
        ]
    elif "Moderate" in risk:
        return [
            "Reduce sugar and refined carbs.",
            "Increase physical activity to 30–45 mins/day.",
            "Lose 5–7% body weight if overweight.",
            "Track glucose every 3–6 months.",
            "Add high-fiber foods to diet."
        ]
    else:  # High risk
        return [
            "Consult a healthcare professional.",
            "Limit carbohydrates and processed foods.",
            "Exercise 45–60 mins per day (moderate intensity).",
            "Monitor glucose weekly.",
            "Consider a low-glycemic diet.",
            "Check HbA1c every 3 months."
        ]
    
def get_extended_analysis(data):
    sbp = getattr(data, 'systolic_bp', 0)
    dbp = getattr(data, 'diastolic_bp', 0)

    # 1. Hypertension Status
    if sbp >= 140 or dbp >= 90:
        hyp = "High Risk (Stage 2)"
    elif sbp >= 130 or dbp >= 80:
        hyp = "Elevated (Stage 1)"
    else:
        hyp = "Normal"

    # 2. Metabolic Syndrome
    met_score = 0
    if getattr(data, 'bmi', 0) >= 30: met_score += 1
    if sbp >= 130 or dbp >= 85: met_score += 1
    if getattr(data, 'glucose', 0) >= 100: met_score += 1
    if getattr(data, 'cholesterol', 0) >= 200: met_score += 1
    met = "High Risk" if met_score >= 3 else "Low Risk"

    # 3. Cardiovascular Risk
    age = getattr(data, 'age', 0)
    chol = getattr(data, 'cholesterol', 0)
    cardio = "Elevated" if age > 50 and (sbp >= 140 or chol >= 240) else "Normal"

    return {"hypertension_status": hyp, "metabolic_syndrome": met, "cardiovascular_risk": cardio}
# -------------------------------
# Prediction Endpoint
# -------------------------------
@app.post("/predict")
def predict(data: DiabetesInput):

    # Convert input to model order
    input_df = pd.DataFrame([{
        f: getattr(data, f) for f in FEATURES
    }])

    # ML prediction
    prob = model.predict_proba(input_df)[0][1]
    prob = float(prob)

    # Interpret risks
    ml_risk, final_risk, gl_status, a1c_status = risk_level(
        prob, data.glucose, data.hba1c
    )

    # Recommendations
    # Define the extended variable by calling the analysis function 
    recs = generate_recommendations(final_risk)
    extended = get_extended_analysis(data)  

    return {
        "summary": {
            "final_risk_level": final_risk,
            "probability_score": round(prob, 4),
        },
        "ml_details": {
            "model_probability": prob,
            "ml_risk_interpretation": ml_risk
        },
        "clinical_analysis": {
            "glucose_status": gl_status,
            "hba1c_status": a1c_status,
            
            "hypertension_status": extended["hypertension_status"],
            "metabolic_syndrome": extended["metabolic_syndrome"],
            "cardiovascular_risk": extended["cardiovascular_risk"]
        },
        "recommendations": recs
    }

# -------------------------------
# Root endpoint
# -------------------------------
@app.get("/")
def root():
    return {"message": "SmartDiab AI API running successfully!"}
