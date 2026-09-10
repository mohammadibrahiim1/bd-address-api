import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

// Load environment variables
dotenv.config();

// Configs & Routes
import connectDB from './config/db';
import divisionRouter from './routes/division.route';
import districtsRouter from './routes/districts.route';
import subDistrictsRouter from './routes/sub-districts.route';
import authRouter from './routes/user.route';

// Initialize Express app
const app: Application = express();

// Ensure DB connects on serverless invocation
app.use(async (req: Request, res: Response, next: NextFunction) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    next(error);
  }
});

// Middleware & CORS Setup
const allowedOrigins = ['http://localhost:5173', 'http://localhost:3000', 'https://rprdac.com'];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (e.g. mobile apps, curl, Postman)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  }),
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/v1/divisions', divisionRouter);
app.use('/api/v1/districts', districtsRouter);
app.use('/api/v1/sub-districts', subDistrictsRouter);
app.use('/api/v1/auth', authRouter);

// Test Route
app.get('/', (req: Request, res: Response) => {
  res.status(200).send('🌍 API is running...');
});

// Global Error Handler
app.use((err: any, req: Request, res: Response, next:  NextFunction) => {
  console.error('Global error handler:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

// Start server locally (Skipped on Vercel)
if (process.env.NODE_ENV !== 'production') {
  const PORT: number = parseInt(process.env.PORT || '9000', 10);
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

// Export for Vercel Serverless Function
export default app;
