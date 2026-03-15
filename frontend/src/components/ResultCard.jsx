import {
  Card,
  CardContent,
  Typography,
  Divider,
  List,
  ListItem,
  Chip,
  Button,
  Box,
  Grid,
} from "@mui/material";
import { motion } from "framer-motion";
import jsPDF from "jspdf";

// ── Doctor Recommendation Logic
function getDoctorRecommendations(summary, clinical_analysis) {
  const doctors = [];
  const riskLevel = summary.final_risk_level;
  const glucose = clinical_analysis.glucose_status;
  const hba1c = clinical_analysis.hba1c_status;
  const bp = clinical_analysis.hypertension_status;
  const metabolic = clinical_analysis.metabolic_syndrome;
  const cvd = clinical_analysis.cardiovascular_risk;

  // Based on Glucose / HbA1c
  if (glucose === "Diabetic" || hba1c === "Diabetic") {
    doctors.push({
      icon: "🩺",
      type: "Endocrinologist / Diabetologist",
      reason: "Specialises in diabetes management and blood sugar control",
      urgency: "high",
    });
  } else if (glucose === "Prediabetic" || hba1c === "Prediabetic") {
    doctors.push({
      icon: "👨‍⚕️",
      type: "General Physician",
      reason: "For prediabetes management and lifestyle guidance",
      urgency: "medium",
    });
  }

  // Based on Blood Pressure
  if (bp === "High Risk (Stage 2)") {
    doctors.push({
      icon: "❤️",
      type: "Cardiologist",
      reason: "Stage 2 Hypertension requires specialist heart care",
      urgency: "high",
    });
  } else if (bp === "Elevated (Stage 1)" || bp === "Elevated") {
    doctors.push({
      icon: "👨‍⚕️",
      type: "General Physician",
      reason: "For blood pressure monitoring and medication if needed",
      urgency: "medium",
    });
  }

  // Based on Metabolic Syndrome
  if (metabolic === "High Risk") {
    doctors.push({
      icon: "🏥",
      type: "Internal Medicine Specialist",
      reason: "Manages metabolic syndrome and related conditions holistically",
      urgency: "high",
    });
  }

  // Based on CVD
  if (cvd === "Elevated" || cvd === "High Risk") {
    doctors.push({
      icon: "💓",
      type: "Cardiologist",
      reason: "Elevated cardiovascular risk needs heart specialist evaluation",
      urgency: "high",
    });
  }

  // Based on overall risk level
  if (riskLevel === "Low Risk (Normal)") {
    doctors.push({
      icon: "✅",
      type: "General Physician",
      reason: "Routine yearly checkup to maintain your good health",
      urgency: "low",
    });
  }

  // Add Dietitian for all non-low risk
  if (riskLevel !== "Low Risk (Normal)") {
    doctors.push({
      icon: "🥗",
      type: "Dietitian / Nutritionist",
      reason: "For personalised diet plan to manage glucose, BMI and cholesterol",
      urgency: "medium",
    });
  }

  // Remove duplicates by type
  const seen = new Set();
  return doctors.filter((d) => {
    if (seen.has(d.type)) return false;
    seen.add(d.type);
    return true;
  });
}

const urgencyConfig = {
  high: {
    color: "#c62828",
    bg: "#fce4e4",
    border: "#ef9a9a",
    label: "Consult Soon",
  },
  medium: {
    color: "#e65100",
    bg: "#fff3e0",
    border: "#ffcc80",
    label: "Recommended",
  },
  low: {
    color: "#2e7d32",
    bg: "#e8f5e9",
    border: "#a5d6a7",
    label: "Routine Visit",
  },
};

export default function ResultCard({ result, inputs }) {
  if (!result) return null;

  const { summary, clinical_analysis, recommendations } = result;

  const colorMap = {
    "Low Risk (Normal)": "success",
    "Moderate Risk (Prediabetic)": "warning",
    "High Risk (Diabetic)": "error",
  };

  const doctors = getDoctorRecommendations(summary, clinical_analysis);

  const downloadReport = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const now = new Date();
    const dateStr = now.toLocaleDateString();
    const timeStr = now.toLocaleTimeString();

    // Header
    doc.setFillColor(26, 58, 143);
    doc.rect(0, 0, pageWidth, 38, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("AI Smart Health Risk Assessment", pageWidth / 2, 16, { align: "center" });
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text("Diabetes & Metabolic Risk Report", pageWidth / 2, 26, { align: "center" });
    doc.setFontSize(9);
    doc.text(`Generated on: ${dateStr} at ${timeStr}`, pageWidth / 2, 34, { align: "center" });

    let y = 48;

    // Risk Badge
    const riskLevel = summary.final_risk_level;
    const riskColor =
      riskLevel === "High Risk (Diabetic)"
        ? [198, 40, 40]
        : riskLevel === "Moderate Risk (Prediabetic)"
        ? [230, 81, 0]
        : [46, 125, 50];

    doc.setFillColor(...riskColor);
    doc.roundedRect(14, y, pageWidth - 28, 12, 3, 3, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(riskLevel, pageWidth / 2, y + 8, { align: "center" });
    y += 20;

    // Probability
    doc.setTextColor(26, 58, 143);
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text(`AI Probability Score: ${summary.probability_score}`, 14, y);
    y += 10;

    doc.setDrawColor(200, 200, 200);
    doc.line(14, y, pageWidth - 14, y);
    y += 8;

    // Health Inputs
    doc.setFillColor(240, 244, 255);
    doc.rect(14, y - 4, pageWidth - 28, 8, "F");
    doc.setTextColor(26, 58, 143);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Health Input Values", 16, y + 2);
    y += 12;

    const inputData = inputs ? [
      ["Age", `${inputs.age} years`],
      ["BMI", `${inputs.bmi}`],
      ["Systolic BP", `${inputs.systolic_bp} mmHg`],
      ["Diastolic BP", `${inputs.diastolic_bp} mmHg`],
      ["Glucose", `${inputs.glucose} mg/dL`],
      ["HbA1c", `${inputs.hba1c} %`],
      ["Cholesterol", `${inputs.cholesterol} mg/dL`],
    ] : [];

    inputData.forEach(([label, value], i) => {
      const isLeft = i % 2 === 0;
      const col = isLeft ? 16 : pageWidth / 2 + 8;
      if (isLeft && i !== 0) y += 8;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);
      doc.text(`${label}:`, col, y);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(30, 30, 30);
      doc.text(value, col + 35, y);
    });

    y += 14;
    doc.setDrawColor(200, 200, 200);
    doc.line(14, y, pageWidth - 14, y);
    y += 8;

    // Clinical Interpretation
    doc.setFillColor(240, 244, 255);
    doc.rect(14, y - 4, pageWidth - 28, 8, "F");
    doc.setTextColor(26, 58, 143);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Clinical Interpretation", 16, y + 2);
    y += 12;

    const clinical = [
      ["Glucose Status", clinical_analysis.glucose_status],
      ["HbA1c Status", clinical_analysis.hba1c_status],
      ["Hypertension Status", clinical_analysis.hypertension_status],
      ["Metabolic Syndrome", clinical_analysis.metabolic_syndrome],
      ["Cardiovascular Risk", clinical_analysis.cardiovascular_risk],
    ];

    clinical.forEach(([label, value], i) => {
      if (i % 2 === 0) {
        doc.setFillColor(248, 250, 255);
        doc.rect(14, y - 5, pageWidth - 28, 9, "F");
      }
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      doc.text(`${label}:`, 18, y);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(30, 30, 30);
      doc.text(value, 80, y);
      y += 10;
    });

    y += 4;
    doc.setDrawColor(200, 200, 200);
    doc.line(14, y, pageWidth - 14, y);
    y += 8;

    // Recommendations
    doc.setFillColor(240, 244, 255);
    doc.rect(14, y - 4, pageWidth - 28, 8, "F");
    doc.setTextColor(26, 58, 143);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Recommended Actions", 16, y + 2);
    y += 12;

    doc.setTextColor(40, 40, 40);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    recommendations.forEach((rec) => {
      doc.setFillColor(...riskColor);
      doc.circle(19, y - 2, 1.5, "F");
      const lines = doc.splitTextToSize(rec, pageWidth - 42);
      doc.text(lines, 24, y);
      y += lines.length * 7 + 2;
      if (y > 260) { doc.addPage(); y = 20; }
    });

    y += 4;
    doc.setDrawColor(200, 200, 200);
    doc.line(14, y, pageWidth - 14, y);
    y += 8;

    // Doctor Recommendations in PDF
    doc.setFillColor(240, 244, 255);
    doc.rect(14, y - 4, pageWidth - 28, 8, "F");
    doc.setTextColor(26, 58, 143);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Recommended Doctors to Consult", 16, y + 2);
    y += 12;

    doctors.forEach((d) => {
      if (y > 260) { doc.addPage(); y = 20; }
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(30, 30, 30);
      doc.text(`• ${d.type}`, 18, y);
      y += 6;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(80, 80, 80);
      doc.text(`  ${d.reason}`, 18, y);
      y += 8;
    });

    y += 4;

    // Footer
    doc.setDrawColor(200, 200, 200);
    doc.line(14, y, pageWidth - 14, y);
    y += 6;
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.setFont("helvetica", "italic");
    doc.text(
      "This report is generated by an AI system for informational purposes only.",
      pageWidth / 2, y, { align: "center" }
    );
    y += 5;
    doc.text(
      "Please consult a qualified healthcare professional for medical advice.",
      pageWidth / 2, y, { align: "center" }
    );

    doc.save(`Health_Risk_Report_${dateStr.replace(/\//g, "-")}.pdf`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
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
          {/* Risk Chip */}
          <Chip
            label={summary.final_risk_level}
            color={colorMap[summary.final_risk_level]}
            sx={{ fontSize: "1rem", mb: 2, py: 1.2, width: "100%" }}
          />

          {/* Probability Score */}
          <Typography variant="h6">
            AI Probability Score: {summary.probability_score}
          </Typography>

          <Divider sx={{ my: 2 }} />

          {/* Clinical Interpretation */}
          <Typography variant="h6">Clinical Interpretation</Typography>
          <List dense>
            <ListItem>- Glucose Status: {clinical_analysis.glucose_status}</ListItem>
            <ListItem>- HbA1c Status: {clinical_analysis.hba1c_status}</ListItem>
            <ListItem>- Hypertension Status: {clinical_analysis.hypertension_status}</ListItem>
            <ListItem>- Metabolic Syndrome: {clinical_analysis.metabolic_syndrome}</ListItem>
            <ListItem>- Cardiovascular Risk: {clinical_analysis.cardiovascular_risk}</ListItem>
          </List>

          <Divider sx={{ my: 2 }} />

          {/* Recommended Actions */}
          <Typography variant="h6">Recommended Actions</Typography>
          <List dense>
            {recommendations.map((r, i) => (
              <ListItem key={i}>• {r}</ListItem>
            ))}
          </List>

          <Divider sx={{ my: 2 }} />

          {/* ── DOCTOR RECOMMENDATIONS ── */}
          <Box
            sx={{
              background: "#f0f4ff",
              borderRadius: 3,
              p: 2.5,
              border: "1px solid #c5d3f7",
            }}
          >
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, color: "#1a3a8f", mb: 2 }}
            >
              🏥 Recommended Doctors to Consult
            </Typography>

            <Grid container spacing={2}>
              {doctors.map((doctor, i) => {
                const config = urgencyConfig[doctor.urgency];
                return (
                  <Grid item xs={12} key={i}>
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <Box
                        sx={{
                          background: config.bg,
                          border: `1px solid ${config.border}`,
                          borderRadius: 2,
                          p: 1.8,
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 1.5,
                        }}
                      >
                        {/* Icon */}
                        <Typography fontSize="1.6rem">
                          {doctor.icon}
                        </Typography>

                        {/* Info */}
                        <Box sx={{ flex: 1 }}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                              flexWrap: "wrap",
                              mb: 0.4,
                            }}
                          >
                            <Typography
                              variant="body1"
                              fontWeight={700}
                              color="#222"
                            >
                              {doctor.type}
                            </Typography>
                            <Chip
                              label={config.label}
                              size="small"
                              sx={{
                                background: config.color,
                                color: "white",
                                fontWeight: 600,
                                fontSize: "0.7rem",
                                height: 20,
                              }}
                            />
                          </Box>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                          >
                            {doctor.reason}
                          </Typography>
                        </Box>
                      </Box>
                    </motion.div>
                  </Grid>
                );
              })}
            </Grid>

            {/* Disclaimer */}
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mt: 2, display: "block" }}
            >
              ⚠️ These recommendations are AI-generated. Always consult a
              qualified healthcare professional for proper diagnosis and
              treatment.
            </Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Download Button */}
          <Button
            fullWidth
            variant="contained"
            onClick={downloadReport}
            sx={{
              mt: 1,
              py: 1.4,
              fontSize: "0.95rem",
              fontWeight: "bold",
              borderRadius: 3,
              background: "linear-gradient(135deg, #1a3a8f, #4a7fd4)",
              "&:hover": {
                background: "linear-gradient(135deg, #0d2b6b, #1a3a8f)",
              },
            }}
          >
            ⬇ Download Health Report (PDF)
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}