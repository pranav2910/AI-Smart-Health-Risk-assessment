const express = require("express");
const axios = require("axios");
const Prediction = require("../models/Prediction");

const router = express.Router();

// POST /predict
router.post("/", async (req, res) => {
    try {
        const fastapi_url = process.env.FASTAPI_URL || "http://127.0.0.1:8000/predict";

        // Send data to FastAPI
        const { data } = await axios.post(fastapi_url, req.body);

        // FastAPI returns summary, clinical_analysis, recommendations directly
        const ai = data;

        // Save into MongoDB
        const saved = await Prediction.create({
            age: req.body.age,
            bmi: req.body.bmi,
            systolic_bp: req.body.systolic_bp,
            diastolic_bp: req.body.diastolic_bp,
            glucose: req.body.glucose,
            hba1c: req.body.hba1c,
            cholesterol: req.body.cholesterol,

            risk_score: ai.summary.probability_score,
            risk_level: ai.summary.final_risk_level
        });

        return res.json({
            status: "success",
            ai,
            saved
        });

    } catch (error) {
        console.error("Prediction error:", error);
        return res.status(500).json({
            status: "error",
            message: "Prediction failed",
            error: error.message
        });
    }
});

// GET /history (for charts)
router.get("/history", async (req, res) => {
    try {
        const history = await Prediction.find().sort({ createdAt: 1 });
        res.json(history);
    } catch (err) {
        res.status(500).json({ message: "History fetch error" });
    }
});

module.exports = router;
