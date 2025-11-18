import jwt from "jsonwebtoken";

import { NextFunction, Response, Request } from "express";

interface AuthRequest extends Request {
  user?: { id: string; role: string };
}

const JWT_SECRET = process.env.JWT_SECRET_KEY || "fallbackSecret";

export const protect = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  console.log("Cookies:", req.cookies);
  console.log("Auth Header:", req.headers.authorization);

  const token =
    req.cookies?.token ||
    req.headers.authorization?.replace("Bearer ", "") ||
    req.body?.token;

  console.log("Token extraction:", {
    hasCookies: !!req.cookies,
    hasAuthHeader: !!req.headers.authorization,
    extractedToken: token ? `${token.substring(0, 10)}...` : "No token",
  });

  if (!token)
    return res.status(401).json({
      message: "Not authorized - No token",
    });

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      role: string;
    };
    console.log("Token decoded successfully:", {
      id: decoded.id,
      role: decoded.role,
    });

    req.user = decoded;

    next();
  } catch (error) {
    console.log("JWT Error:", error);
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        message: "Token expired",
      });
    }

    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        message: "Invalid token",
      });
    }
    return res.status(401).json({
      message: "Authentication failed",
    });
  }
};
