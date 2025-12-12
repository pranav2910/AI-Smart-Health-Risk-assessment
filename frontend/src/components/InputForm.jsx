import { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Button,
  Box,
} from "@mui/material";
import { motion } from "framer-motion";
import { api } from "../api";

export default function InputForm({ onResult }) {
  const [form, setForm] = useState({
    age: "",
    bmi: "",
    systolic_bp: "",
    diastolic_bp: "",
    glucose: "",
    hba1c: "",
    cholesterol: "",
  });

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const payload = Object.fromEntries(
      Object.entries(form).map(([k, v]) => [k, Number(v)])
    );

    const { data } = await api.post("/predict", payload);
    onResult(data.ai);
  }

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

          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {Object.keys(form).map((field) => (
                <Grid item xs={12} sm={6} key={field}>
                  <TextField
                    fullWidth
                    label={field.replace("_", " ").toUpperCase()}
                    name={field}
                    type="number"
                    value={form[field]}
                    onChange={handleChange}
                    variant="outlined"
                    required
                  />
                </Grid>
              ))}
            </Grid>

            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{
                mt: 4,
                py: 1.5,
                fontSize: "1.1rem",
                fontWeight: 600,
              }}
            >
              Predict Diabetes Risk
            </Button>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
}
