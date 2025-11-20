// const express = require("express");
// const dotenv = require("dotenv");
// const cors = require("cors");
// const connectDB = require("./config/db");

// // Load environment variables
// dotenv.config();

// const divisionRouter = require("./routes/division.route");
// const districtsRouter = require("./routes/districts.route");
// const subDistrictsRouter = require("./routes/sub-districts.route");

// // Connect to MongoDB
// connectDB();

// const app = express();

// // Middleware
// app.use(cors());
// app.use(express.json());

// // Routes
// app.use("/api/divisions", divisionRouter);
// app.use("/api/districts", districtsRouter);
// app.use("/api/sub-districts", subDistrictsRouter);

// // Test route
// app.get("/", (req, res) => {
//   res.send("🌍 API is running...");
// });

// // Start server
// const PORT = process.env.PORT || 9000;
// app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
import { VercelRequest, VercelResponse } from "@vercel/node";
import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
dotenv.config();

// Routes
import divisionRouter from "./routes/division.route";
import districtsRouter from "./routes/districts.route";
import subDistrictsRouter from "./routes/sub-districts.route";
import authRouter from "./routes/user.route";
import connectDB from "./config/db";

// Load environment variables

// Connect to MongoDB
connectDB();

// Initialize Express app
const app: Application = express();

// Middleware
const allowedOrigins = ["http://localhost:3000"]; // frontend URL
app.use(
  cors({
    origin: function (origin, callback) {
      //allow requests with no origin
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use("/api/v1/divisions", divisionRouter);
app.use("/api/v1/districts", districtsRouter);
app.use("/api/v1/sub-districts", subDistrictsRouter);
app.use("/api/v1/auth", authRouter);

// Test route
app.get("/", (req: Request, res: Response) => {
  res.status(200).send("🌍 API is running...");
});

// Global error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("Global error handler:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

// Start server
const PORT: number = parseInt(process.env.PORT || "9000", 10);

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// Export app as a Vercel serverless function
export default (req: VercelRequest, res: VercelResponse) => {
  app(req, res);
};
