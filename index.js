const express = require("express");
const cors = require("cors");
const path = require("path");
const apiRoutes = require("./src/routes/apiRoutes");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

app.use("/api", apiRoutes);

app.get("/", (req, res) => {
  res.send("API RS Ngesti Waluyo is Running...");
});

console.log("API is Running...");

app.listen(PORT, () => {
  console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
});
