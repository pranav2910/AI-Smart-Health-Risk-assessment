import {
  Card,
  CardContent,
  Typography,
  Divider,
  List,
  ListItem,
  Chip,
} from "@mui/material";
import { motion } from "framer-motion";

export default function ResultCard({ result }) {
  if (!result) return null;

  const { summary, clinical_analysis, recommendations } = result;

  const colorMap = {
    "Low Risk (Normal)": "success",
    "Moderate Risk (Prediabetic)": "warning",
    "High Risk (Diabetic)": "error",
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
          <Chip
            label={summary.final_risk_level}
            color={colorMap[summary.final_risk_level]}
            sx={{
              fontSize: "1rem",
              mb: 2,
              py: 1.2,
              width: "100%",
            }}
          />

          <Typography variant="h6">
            AI Probability Score: {summary.probability_score}
          </Typography>

          <Divider sx={{ my: 2 }} />

          <Typography variant="h6">Clinical Interpretation</Typography>
          <List dense>
            <ListItem>- Glucose Status: {clinical_analysis.glucose_status}</ListItem>
            <ListItem>- HbA1c Status: {clinical_analysis.hba1c_status}</ListItem>
          </List>

          <Divider sx={{ my: 2 }} />

          <Typography variant="h6">Recommended Actions</Typography>
          <List dense>
            {recommendations.map((r, i) => (
              <ListItem key={i}>• {r}</ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
    </motion.div>
  );
}
