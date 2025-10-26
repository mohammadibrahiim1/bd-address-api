const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

// Load environment variables
dotenv.config();

const divisionRouter = require("./routes/division.route");
const districtsRouter = require("./routes/districts.route");
const subDistrictsRouter = require("./routes/sub-districts.route");

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/divisions", divisionRouter);
app.use("/api/districts", districtsRouter);
app.use("/api/sub-districts", subDistrictsRouter);

// Test route
app.get("/", (req, res) => {
  res.send("🌍 API is running...");
});

// Start server
const PORT = process.env.PORT || 9000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
