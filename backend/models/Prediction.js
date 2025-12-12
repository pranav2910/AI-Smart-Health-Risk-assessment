const mongoose = require("mongoose");

const PredictionSchema = new mongoose.Schema(
  {
    age: Number,
    bmi: Number,
    systolic_bp: Number,
    diastolic_bp: Number,
    glucose: Number,
    hba1c: Number,
    cholesterol: Number,

    risk_score: Number,      // instead of ml_probability
    risk_level: String,      // instead of final_risk_level
  },
  { timestamps: true }       // auto creates createdAt
);

module.exports = mongoose.model("Prediction", PredictionSchema);
