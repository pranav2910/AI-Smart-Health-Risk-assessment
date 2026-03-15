import { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Button,
  Box,
  Divider,
  Chip,
} from "@mui/material";
import { motion } from "framer-motion";
import { api } from "../api";

export default function InputForm({ onResult, onInputs }) {
  const [form, setForm] = useState({
    age: "",
    bmi: "",
    systolic_bp: "",
    diastolic_bp: "",
    glucose: "",
    hba1c: "",
    cholesterol: "",
  });

  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [bmiCategory, setBmiCategory] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  // ── BMI Calculator
  function calculateBMI() {
    if (!height || !weight) return;
    const h = parseFloat(height) / 100;
    const w = parseFloat(weight);
    if (h <= 0 || w <= 0) return;
    const bmi = (w / (h * h)).toFixed(1);
    setForm((prev) => ({ ...prev, bmi: bmi }));
    if (bmi < 18.5) setBmiCategory("Underweight");
    else if (bmi < 25.0) setBmiCategory("Normal");
    else if (bmi < 30.0) setBmiCategory("Overweight");
    else setBmiCategory("Obese");
  }

  const categoryColor = {
    Underweight: "info",
    Normal: "success",
    Overweight: "warning",
    Obese: "error",
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = Object.fromEntries(
        Object.entries(form).map(([k, v]) => [k, Number(v)])
      );
      onInputs(payload);
      const { data } = await api.post("/predict", payload);
      onResult(data.ai);
    } catch (error) {
      console.error("Prediction failed:", error);
    } finally {
      setLoading(false);
    }
  }

  const fieldLabels = {
    age: "AGE (years)",
    bmi: "BMI (auto-calculated)",
    systolic_bp: "SYSTOLIC BP (mmHg)",
    diastolic_bp: "DIASTOLIC BP (mmHg)",
    glucose: "GLUCOSE (mg/dL)",
    hba1c: "HBA1C (%)",
    cholesterol: "CHOLESTEROL (mg/dL)",
  };

  const fieldHints = {
    age: "Normal: 1 – 120 years",
    bmi: "Normal: 18.5 – 24.9",
    systolic_bp: "Normal: 90 – 120 mmHg",
    diastolic_bp: "Normal: 60 – 80 mmHg",
    glucose: "Normal: 70 – 99 mg/dL",
    hba1c: "Normal: below 5.7%",
    cholesterol: "Normal: below 200 mg/dL",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card
        sx={{
          maxWidth: 700,
          mx: "auto",
          mt: 4,
          p: 3,
          borderRadius: 4,
          background: "white",
          boxShadow: "0 6px 25px rgba(0,0,0,0.08)",
        }}
      >
        <CardContent>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
            Enter Your Health Details
          </Typography>

          {/* ── BMI CALCULATOR SECTION ── */}
          <Box
            sx={{
              background: "#f0f4ff",
              borderRadius: 3,
              p: 2.5,
              mb: 3,
              border: "1px solid #c5d3f7",
            }}
          >
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 700, color: "#1a3a8f", mb: 1.5 }}
            >
              🧮 BMI Calculator
            </Typography>

            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Height (cm)"
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  variant="outlined"
                  size="small"
                  placeholder="e.g. 170"
                  helperText="Enter height in cm"
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Weight (kg)"
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  variant="outlined"
                  size="small"
                  placeholder="e.g. 70"
                  helperText="Enter weight in kg"
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={calculateBMI}
                  sx={{
                    py: 1,
                    fontWeight: 600,
                    background: "linear-gradient(135deg, #1a3a8f, #4a7fd4)",
                    "&:hover": {
                      background: "linear-gradient(135deg, #0d2b6b, #1a3a8f)",
                    },
                  }}
                >
                  Calculate BMI
                </Button>
              </Grid>
            </Grid>

            {/* BMI Result */}
            {form.bmi && bmiCategory && (
              <Box
                sx={{
                  mt: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  flexWrap: "wrap",
                }}
              >
                <Typography sx={{ fontWeight: 600, color: "#1a3a8f" }}>
                  Your BMI: {form.bmi}
                </Typography>
                <Chip
                  label={bmiCategory}
                  color={categoryColor[bmiCategory]}
                  size="small"
                  sx={{ fontWeight: 600 }}
                />
                <Typography variant="caption" color="text.secondary">
                  ✅ BMI has been auto-filled in the form below
                </Typography>
              </Box>
            )}

            {/* BMI Scale */}
            <Box sx={{ mt: 1.5 }}>
              <Typography variant="caption" color="text.secondary">
                📊 BMI Scale: &nbsp;
                <span style={{ color: "#0288d1" }}>
                  Underweight (&lt;18.5)
                </span>{" "}
                &nbsp;|&nbsp;
                <span style={{ color: "#2e7d32" }}>Normal (18.5–24.9)</span>
                &nbsp;|&nbsp;
                <span style={{ color: "#e65100" }}>Overweight (25–29.9)</span>
                &nbsp;|&nbsp;
                <span style={{ color: "#c62828" }}>Obese (≥30)</span>
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* ── HEALTH INPUT FORM ── */}
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {Object.keys(form).map((field) => (
                <Grid item xs={12} sm={6} key={field}>
                  <TextField
                    fullWidth
                    label={fieldLabels[field]}
                    name={field}
                    type="number"
                    value={form[field]}
                    onChange={handleChange}
                    variant="outlined"
                    required
                    InputProps={
                      field === "bmi" && form.bmi
                        ? {
                            sx: {
                              background: "#f0fff0",
                              borderColor: "#2e7d32",
                            },
                          }
                        : {}
                    }
                    helperText={
                      <span style={{ color: "#888", fontSize: "11px" }}>
                        {fieldHints[field]}
                      </span>
                    }
                  />
                </Grid>
              ))}
            </Grid>

            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={loading}
              sx={{
                mt: 4,
                py: 1.5,
                fontSize: "1.1rem",
                fontWeight: 600,
              }}
            >
              {loading ? "Predicting..." : "PREDICT RISK"}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
}