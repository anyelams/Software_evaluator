const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 4000;

const authRoutes = require("./routes/authRoutes");
const standardRoutes = require("./routes/standardRoutes");
const criteriaRoutes = require("./routes/criteriaRoutes");
const subcriteriaRoutes = require("./routes/subcriteriaRoutes");
const companyRoutes = require("./routes/companyRoutes");
const softwareRoutes = require("./routes/softwareRoutes");
const evaluationRoutes = require("./routes/evaluationRoutes");
const evaluatorRoutes = require("./routes/evaluatorRoutes");
const userRoutes = require("./routes/userRoutes");

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/standards", standardRoutes);
app.use("/api/criteria", criteriaRoutes);
app.use("/api/subcriteria", subcriteriaRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/softwares", softwareRoutes);
app.use("/api/evaluations", evaluationRoutes);
app.use("/api/evaluator", evaluatorRoutes);

app.get("/", (req, res) => {
  res.send("API Evaluador de Software funcionando.");
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
