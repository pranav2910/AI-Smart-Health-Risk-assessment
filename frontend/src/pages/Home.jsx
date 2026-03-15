import { useState } from "react";
import Layout from "../components/Layout";
import InputForm from "../components/InputForm";
import ResultCard from "../components/ResultCard";
import {
  Box,
  Button,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Divider,
} from "@mui/material";
import { motion } from "framer-motion";

// ── Helper: compare two values and return color
function getDiffColor(field, val1, val2) {
  const higherIsBetter = []; // none in our case
  const lowerIsBetter = [
    "bmi","glucose","hba1c","systolic_bp",
    "diastolic_bp","cholesterol",
  ];
  if (lowerIsBetter.includes(field)) {
    if (val2 < val1) return "#2e7d32"; // improved = green
    if (val2 > val1) return "#c62828"; // worsened = red
    return "#555"; // no change
  }
  return "#555";
}

// ── Helper: diff label
function getDiffLabel(field, val1, val2) {
  const diff = (val2 - val1).toFixed(1);
  if (diff > 0) return `▲ +${diff}`;
  if (diff < 0) return `▼ ${diff}`;
  return "━ No change";
}

const fieldLabels = {
  age: "Age",
  bmi: "BMI",
  systolic_bp: "Systolic BP",
  diastolic_bp: "Diastolic BP",
  glucose: "Glucose",
  hba1c: "HbA1c",
  cholesterol: "Cholesterol",
};

const fieldUnits = {
  age: "yrs",
  bmi: "",
  systolic_bp: "mmHg",
  diastolic_bp: "mmHg",
  glucose: "mg/dL",
  hba1c: "%",
  cholesterol: "mg/dL",
};

export default function Home() {
  const [result1, setResult1] = useState(null);
  const [inputs1, setInputs1] = useState(null);
  const [result2, setResult2] = useState(null);
  const [inputs2, setInputs2] = useState(null);
  const [compareMode, setCompareMode] = useState(false);
  const [showCompare, setShowCompare] = useState(false);

  function handleResult1(data) {
    setResult1(data);
    setResult2(null);
    setInputs2(null);
    setCompareMode(false);
    setShowCompare(false);
  }

  function handleResult2(data) {
    setResult2(data);
    setShowCompare(true);
    setCompareMode(false);
  }

  const riskColorMap = {
    "Low Risk (Normal)": "#2e7d32",
    "Moderate Risk (Prediabetic)": "#e65100",
    "High Risk (Diabetic)": "#c62828",
  };

  const chipColorMap = {
    "Low Risk (Normal)": "success",
    "Moderate Risk (Prediabetic)": "warning",
    "High Risk (Diabetic)": "error",
  };

  return (
    <Layout>
      {/* ── Show input form only when not in compare mode */}
      {!compareMode && (
        <InputForm
          onResult={handleResult1}
          onInputs={setInputs1}
        />
      )}

      {/* ── Result 1 */}
      {result1 && !compareMode && !showCompare && (
        <>
          <ResultCard result={result1} inputs={inputs1} />

          {/* Compare Button */}
          <Box sx={{ maxWidth: 700, mx: "auto", mt: 2, mb: 4 }}>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Button
                fullWidth
                variant="outlined"
                onClick={() => setCompareMode(true)}
                sx={{
                  py: 1.4,
                  fontSize: "0.95rem",
                  fontWeight: "bold",
                  borderRadius: 3,
                  borderColor: "#1a3a8f",
                  color: "#1a3a8f",
                  borderWidth: 2,
                  "&:hover": {
                    background: "#f0f4ff",
                    borderColor: "#1a3a8f",
                    borderWidth: 2,
                  },
                }}
              >
                🔄 Compare with New Result
              </Button>
            </motion.div>
          </Box>
        </>
      )}

      {/* ── Compare Mode: show second input form */}
      {compareMode && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Box
            sx={{
              maxWidth: 700,
              mx: "auto",
              mt: 3,
              p: 2,
              background: "#fff8e1",
              borderRadius: 3,
              border: "2px dashed #f57c00",
              textAlign: "center",
            }}
          >
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 700, color: "#e65100" }}
            >
              🔄 Enter New Health Values to Compare
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Enter your updated health details below and click Predict Risk
            </Typography>
          </Box>

          <InputForm
            onResult={handleResult2}
            onInputs={setInputs2}
          />

          <Box sx={{ maxWidth: 700, mx: "auto", mt: 1, mb: 2 }}>
            <Button
              fullWidth
              variant="text"
              onClick={() => setCompareMode(false)}
              sx={{ color: "#888" }}
            >
              ✕ Cancel Compare
            </Button>
          </Box>
        </motion.div>
      )}

      {/* ── COMPARISON VIEW */}
      {showCompare && result1 && result2 && (
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Box sx={{ maxWidth: 900, mx: "auto", mt: 4, px: 2 }}>

            {/* Header */}
            <Typography
              variant="h5"
              sx={{
                fontWeight: 800,
                textAlign: "center",
                color: "#1a3a8f",
                mb: 3,
              }}
            >
              📊 Health Results Comparison
            </Typography>

            {/* Risk Level Cards */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
              {[
                { label: "Result 1", result: result1 },
                { label: "Result 2", result: result2 },
              ].map(({ label, result }) => (
                <Grid item xs={12} sm={6} key={label}>
                  <Card
                    sx={{
                      borderRadius: 3,
                      boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
                      border: `2px solid ${
                        riskColorMap[result.summary.final_risk_level]
                      }`,
                    }}
                  >
                    <CardContent sx={{ textAlign: "center" }}>
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        sx={{ mb: 1 }}
                      >
                        {label}
                      </Typography>
                      <Chip
                        label={result.summary.final_risk_level}
                        color={chipColorMap[result.summary.final_risk_level]}
                        sx={{ fontSize: "0.9rem", mb: 1.5, px: 1 }}
                      />
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 700,
                          color:
                            riskColorMap[result.summary.final_risk_level],
                        }}
                      >
                        Score: {result.summary.probability_score}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Overall Score Change */}
            {(() => {
              const s1 = parseFloat(result1.summary.probability_score);
              const s2 = parseFloat(result2.summary.probability_score);
              const diff = (s2 - s1).toFixed(3);
              const improved = s2 < s1;
              return (
                <Box
                  sx={{
                    textAlign: "center",
                    mb: 3,
                    p: 2,
                    borderRadius: 3,
                    background: improved ? "#e8f5e9" : "#fce4e4",
                    border: `1px solid ${improved ? "#2e7d32" : "#c62828"}`,
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      color: improved ? "#2e7d32" : "#c62828",
                    }}
                  >
                    {improved
                      ? `✅ Risk Improved by ${Math.abs(diff)}`
                      : `⚠️ Risk Increased by ${Math.abs(diff)}`}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {improved
                      ? "Great progress! Keep up your healthy habits."
                      : "Your risk has increased. Consider consulting a doctor."}
                  </Typography>
                </Box>
              );
            })()}

            {/* Input Values Comparison Table */}
            <Card sx={{ borderRadius: 3, mb: 3, overflow: "hidden" }}>
              <Box
                sx={{
                  background: "#1a3a8f",
                  p: 1.5,
                  textAlign: "center",
                }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{ color: "white", fontWeight: 700 }}
                >
                  Health Input Values Comparison
                </Typography>
              </Box>
              <CardContent sx={{ p: 0 }}>
                {/* Table Header */}
                <Grid
                  container
                  sx={{
                    background: "#f0f4ff",
                    px: 2,
                    py: 1,
                    borderBottom: "1px solid #e0e0e0",
                  }}
                >
                  <Grid item xs={3}>
                    <Typography variant="caption" fontWeight={700} color="#1a3a8f">
                      Parameter
                    </Typography>
                  </Grid>
                  <Grid item xs={3} textAlign="center">
                    <Typography variant="caption" fontWeight={700} color="#1a3a8f">
                      Result 1
                    </Typography>
                  </Grid>
                  <Grid item xs={3} textAlign="center">
                    <Typography variant="caption" fontWeight={700} color="#1a3a8f">
                      Result 2
                    </Typography>
                  </Grid>
                  <Grid item xs={3} textAlign="center">
                    <Typography variant="caption" fontWeight={700} color="#1a3a8f">
                      Change
                    </Typography>
                  </Grid>
                </Grid>

                {/* Table Rows */}
                {Object.keys(fieldLabels).map((field, i) => {
                  const v1 = inputs1?.[field];
                  const v2 = inputs2?.[field];
                  const diffColor = getDiffColor(field, v1, v2);
                  const diffLabel = getDiffLabel(field, v1, v2);
                  return (
                    <Grid
                      container
                      key={field}
                      sx={{
                        px: 2,
                        py: 1,
                        background: i % 2 === 0 ? "#fafbff" : "white",
                        borderBottom: "1px solid #f0f0f0",
                        alignItems: "center",
                      }}
                    >
                      <Grid item xs={3}>
                        <Typography variant="body2" fontWeight={600} color="#333">
                          {fieldLabels[field]}
                          <span style={{ color: "#999", fontSize: 11 }}>
                            {" "}
                            {fieldUnits[field]}
                          </span>
                        </Typography>
                      </Grid>
                      <Grid item xs={3} textAlign="center">
                        <Typography variant="body2" color="#555">
                          {v1 ?? "-"}
                        </Typography>
                      </Grid>
                      <Grid item xs={3} textAlign="center">
                        <Typography
                          variant="body2"
                          fontWeight={600}
                          color={diffColor}
                        >
                          {v2 ?? "-"}
                        </Typography>
                      </Grid>
                      <Grid item xs={3} textAlign="center">
                        <Typography
                          variant="caption"
                          fontWeight={700}
                          color={diffColor}
                        >
                          {diffLabel}
                        </Typography>
                      </Grid>
                    </Grid>
                  );
                })}
              </CardContent>
            </Card>

            {/* Clinical Comparison */}
            <Card sx={{ borderRadius: 3, mb: 3, overflow: "hidden" }}>
              <Box sx={{ background: "#1a3a8f", p: 1.5, textAlign: "center" }}>
                <Typography
                  variant="subtitle1"
                  sx={{ color: "white", fontWeight: 700 }}
                >
                  Clinical Interpretation Comparison
                </Typography>
              </Box>
              <CardContent sx={{ p: 0 }}>
                {[
                  ["Glucose Status", "glucose_status"],
                  ["HbA1c Status", "hba1c_status"],
                  ["Hypertension", "hypertension_status"],
                  ["Metabolic Syndrome", "metabolic_syndrome"],
                  ["Cardiovascular Risk", "cardiovascular_risk"],
                ].map(([label, key], i) => (
                  <Grid
                    container
                    key={key}
                    sx={{
                      px: 2,
                      py: 1.2,
                      background: i % 2 === 0 ? "#fafbff" : "white",
                      borderBottom: "1px solid #f0f0f0",
                      alignItems: "center",
                    }}
                  >
                    <Grid item xs={4}>
                      <Typography variant="body2" fontWeight={600} color="#333">
                        {label}
                      </Typography>
                    </Grid>
                    <Grid item xs={4} textAlign="center">
                      <Typography variant="body2" color="#555">
                        {result1.clinical_analysis[key]}
                      </Typography>
                    </Grid>
                    <Grid item xs={4} textAlign="center">
                      <Typography variant="body2" fontWeight={600}
                        color={
                          result2.clinical_analysis[key] ===
                          result1.clinical_analysis[key]
                            ? "#555"
                            : result2.clinical_analysis[key] === "Normal" ||
                              result2.clinical_analysis[key] === "Low Risk"
                            ? "#2e7d32"
                            : "#c62828"
                        }
                      >
                        {result2.clinical_analysis[key]}
                      </Typography>
                    </Grid>
                  </Grid>
                ))}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => {
                    setResult2(null);
                    setInputs2(null);
                    setShowCompare(false);
                    setCompareMode(false);
                  }}
                  sx={{
                    py: 1.3,
                    fontWeight: 600,
                    borderRadius: 3,
                    borderColor: "#1a3a8f",
                    color: "#1a3a8f",
                    borderWidth: 2,
                  }}
                >
                  🔄 Compare Again
                </Button>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => {
                    setResult1(null);
                    setResult2(null);
                    setInputs1(null);
                    setInputs2(null);
                    setShowCompare(false);
                    setCompareMode(false);
                  }}
                  sx={{
                    py: 1.3,
                    fontWeight: 600,
                    borderRadius: 3,
                    background: "linear-gradient(135deg, #1a3a8f, #4a7fd4)",
                  }}
                >
                  🏠 Start Fresh
                </Button>
              </Grid>
            </Grid>
          </Box>
        </motion.div>
      )}
    </Layout>
  );
}