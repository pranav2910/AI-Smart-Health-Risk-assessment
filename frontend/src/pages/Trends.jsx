import { useEffect, useState } from "react";

import {
  Card,
  CardContent,
  Grid,
  Typography
} from "@mui/material";
import { Line } from "react-chartjs-2";
import { motion } from "framer-motion";
import Layout from "../components/Layout";
import { api } from "../api";

// Chart.js imports
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
);

export default function Trends() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    async function loadData() {
      try {
        const { data } = await api.get("/predict/history"); // ✅ correct endpoint
        setHistory(data);
      } catch (err) {
        console.log("Error loading history:", err);
      }
    }
    loadData();
  }, []);

  // Check if no data yet
  if (!history.length) {
    return (
      <Layout>
        <Typography variant="h5" sx={{ mt: 4 }}>
          No prediction history yet. Make a prediction first!
        </Typography>
      </Layout>
    );
  }

  // Extract fields for charts
  const dates = history.map((h) =>
    new Date(h.createdAt).toLocaleDateString()
  );

  const glucose = history.map((h) => h.glucose);
  const hba1c = history.map((h) => h.hba1c);
  const bmi = history.map((h) => h.bmi);
  const systolic = history.map((h) => h.systolic_bp);
  const diastolic = history.map((h) => h.diastolic_bp);
  const riskScore = history.map((h) => (h.risk_score * 100).toFixed(1));
  const hypertensionTrend = history.map((h) => 
    h.systolic_bp >= 140 || h.diastolic_bp >= 90 ? 2 : 
  h.systolic_bp >= 130 || h.diastolic_bp >= 80 ? 1 : 0
);
const metabolicTrend = history.map((h) => 
  (h.bmi >= 30 ? 1 : 0) + (h.systolic_bp >= 130 ? 1 : 0) + (h.glucose >= 100 ? 1 : 0) >= 2 ? 1 : 0
);
const cardioTrend = history.map((h) => 
  h.age > 50 && (h.systolic_bp >= 140 || h.cholesterol >= 240) ? 1 : 0
);

  // Helper to create chart data
  const makeChart = (label, color, data) => ({
    labels: dates,
    datasets: [
      {
        label,
        data,
        borderColor: color,
        backgroundColor: `${color}33`,
        borderWidth: 3,
        pointRadius: 3,
        tension: 0.3,
      },
    ],
  });

  return (
    <Layout>
      <Typography variant="h4" sx={{ color: 'black', fontWeight: 'bold' , mb: 3 }}>
        Health Trends Dashboard
      </Typography>

      <Grid container spacing={4}>

        {/* Glucose Trend */}
        <Grid item xs={12} md={6}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card sx={{ p: 2 }}>
              <CardContent>
                <Typography variant="h6">Glucose Trend</Typography>
                <Line data={makeChart("Glucose (mg/dL)", "#1976D2", glucose)} />
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* HbA1c Trend */}
        <Grid item xs={12} md={6}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card sx={{ p: 2 }}>
              <CardContent>
                <Typography variant="h6">HbA1c Trend</Typography>
                <Line data={makeChart("HbA1c (%)", "#D32F2F", hba1c)} />
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* AI Risk Score Trend */}
        <Grid item xs={12} md={6}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card sx={{ p: 2 }}>
              <CardContent>
                <Typography variant="h6">Risk Probability (%)</Typography>
                <Line data={makeChart("Risk (%)", "#F57C00", riskScore)} />
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* BMI Trend */}
        <Grid item xs={12} md={6}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card sx={{ p: 2 }}>
              <CardContent>
                <Typography variant="h6">BMI Trend</Typography>
                <Line data={makeChart("BMI", "#388E3C", bmi)} />
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Blood Pressure Trend */}
        <Grid item xs={12} md={12}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card sx={{ p: 2 }}>
              <CardContent>
                <Typography variant="h6">Blood Pressure Trend</Typography>

                <Line
                  data={{
                    labels: dates,
                    datasets: [
                      {
                        label: "Systolic",
                        data: systolic,
                        borderColor: "#0D47A1",
                        backgroundColor: "#0D47A133",
                        tension: 0.3,
                      },
                      {
                        label: "Diastolic",
                        data: diastolic,
                        borderColor: "#1976D2",
                        backgroundColor: "#1976D233",
                        tension: 0.3,
                      },
                    ],
                  }}
                />
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
        
        <Grid item xs={12}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card sx={{ p: 2 }}>
              <CardContent>
                <Typography variant="h6">Multi-Risk Trends</Typography>
                <Typography variant="caption" color="textSecondary" sx={{ mb: 2, display: 'block' }}>
                  (Value 1-2 indicates Elevated/High Risk Status)
                </Typography>
                <Line 
                  data={{
                    labels: dates,
                    datasets: [
                      { label: "Hypertension", data: hypertensionTrend, borderColor: "#FF5722", tension: 0.3 },
                      { label: "Metabolic Syndrome", data: metabolicTrend, borderColor: "#9C27B0", tension: 0.3 },
                      { label: "Cardiovascular Risk", data: cardioTrend, borderColor: "#3F51B5", tension: 0.3 }
                    ]
                  }} 
                />
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        

      </Grid>
    </Layout>
  );
}
