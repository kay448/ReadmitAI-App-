import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Mock ML Model Logic
  const predictReadmission = (data: any) => {
    // Simple heuristic-based "model" for demonstration
    // In a real app, this would call a scikit-learn model via joblib/pickle
    let score = 0;
    
    // Age factor
    const age = parseInt(data.age) || 50;
    if (age > 70) score += 0.2;
    else if (age > 50) score += 0.1;

    // Time in hospital
    const timeInHospital = parseInt(data.timeInHospital) || 3;
    if (timeInHospital > 7) score += 0.25;
    else if (timeInHospital > 4) score += 0.15;

    // Procedures and Medications
    const medications = parseInt(data.numMedications) || 10;
    if (medications > 20) score += 0.2;
    
    const diagnoses = parseInt(data.numDiagnoses) || 5;
    if (diagnoses > 8) score += 0.15;

    // Diabetes medication change
    if (data.change === "Ch") score += 0.1;
    if (data.diabetesMed === "Yes") score += 0.05;

    // Normalize score to probability (0-1)
    const probability = Math.min(Math.max(score + Math.random() * 0.2, 0.05), 0.95);
    
    let riskLevel = "Low";
    if (probability > 0.7) riskLevel = "High";
    else if (probability > 0.4) riskLevel = "Moderate";

    return {
      readmission_probability: parseFloat(probability.toFixed(2)),
      risk_level: riskLevel,
      timestamp: new Date().toISOString()
    };
  };

  // API Routes
  app.post("/api/predict", (req, res) => {
    const prediction = predictReadmission(req.body);
    res.json(prediction);
  });

  app.get("/api/analytics", (req, res) => {
    // Mock analytics data
    res.json({
      totalPredictions: 1248,
      highRiskCount: 342,
      moderateRiskCount: 512,
      lowRiskCount: 394,
      monthlyTrends: [
        { month: "Jan", risk: 0.45 },
        { month: "Feb", risk: 0.42 },
        { month: "Mar", risk: 0.48 },
        { month: "Apr", risk: 0.51 },
      ],
      distribution: [
        { name: "High", value: 342 },
        { name: "Moderate", value: 512 },
        { name: "Low", value: 394 },
      ]
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
