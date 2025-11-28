import User, { UserRole } from "../models/user.model";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import mongoose from "mongoose";
import {
  Notification,
  NotificationStatus,
  NotificationType,
} from "../models/notification.model";

const JWT_SECRET = process.env.JWT_SECRET_KEY || "supersecret";
const JWT_EXPIRES_IN = "10m";

interface AuthRequest extends Request {
  user?: { id: string; role: string };
}

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { userId, name, email, password, confirmPassword, photo, role } =
      req.body;

    console.log(req.body);

    // password match
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        errors: {
          confirmPassword: "Password do not match.",
        },
      });
    }

    //check if email already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "Email already registered!" });
    }

    const newUser = await User.create({
      userId,
      name,
      email,
      password,
      photo: photo || "",
      role: role as UserRole,
      status: "pending",
      isActive: true,
    });

    const token = jwt.sign(
      {
        id: newUser?._id,
        role: newUser.role,
      },
      JWT_SECRET,
      {
        expiresIn: JWT_EXPIRES_IN,
      }
    );

    //send token as http cookies only
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const admins = await User.find({ role: UserRole.ADMIN });

    console.log(admins);

    if (admins.length > 0) {
      const notifications = admins.map((admin) => ({
        user: newUser._id,
        followingUser: admin._id,
        notificationType: NotificationType.STATUS_UPDATE,
        targetId: newUser._id,
        message: `New user registered:${newUser.name} is waiting for approval`,
        role: newUser.role,
        email: newUser.email,
        status: NotificationStatus.PENDING,
        isSeen: false,
      }));
      await Notification.insertMany(notifications);
    }

    return res.status(201).json({
      success: true,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error: any) {
    console.log("Registration error:", error);
    // validation error
    // Mongoose validation errors - EIKHANE MODEL ER VALIDATION MESSAGE GULU ASHBE
    if (error instanceof mongoose.Error.ValidationError) {
      const messages: Record<string, string> = {};

      Object.keys(error.errors).forEach((field) => {
        const errorObj = error.errors[field];

        // Different types of validation errors
        if (errorObj.kind === "required") {
          messages[field] = errorObj.message;
        } else if (errorObj.kind === "minlength") {
          messages[field] = errorObj.message;
        } else if (errorObj.kind === "maxlength") {
          messages[field] = errorObj.message;
        } else if (errorObj.kind === "regexp") {
          messages[field] = errorObj.message;
        } else {
          messages[field] = errorObj.message;
        }
      });

      return res.status(400).json({
        success: false,
        errors: messages,
        message: "Validation failed",
      });
    }

    //duplicate email error
    if (error.code === 11000 && error.keyValue?.email) {
      return res.status(400).json({
        success: false,
        errors: { email: "Email already registered!" },
      });
    }

    res.status(500).json({
      success: false,
      message: error?.message || "Internal serve error",
    });
  }
};


export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Invalid credentials!",
      });
    }

    const user = await User.findOne({ email }).select("+password");
    console.log("found user", user);

    if (!user) {
      return res.status(401).json({
        message: "Invalid credential!",
      });
    }

    const isMatch = await user.comparePassword(password);

    console.log("Password match:", isMatch);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials!" });
    }

    const token = jwt.sign(
      {
        id: user?._id,
        role: user.role,
      },
      JWT_SECRET,
      {
        expiresIn: JWT_EXPIRES_IN,
      }
    );

    console.log("Generated token:", token);

    // Smart cookie settings
    const isProduction = process.env.NODE_ENV === "production";

    res.cookie("token", token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "strict" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      token: token, // Include token in response for testing
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.log("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Authentication failed!",
    });
  }
};

export const logoutUser = (req: Request, res: Response) => {
  res.cookie("token", "", {
    maxAge: 0,
    httpOnly: true,
  });
  res.status(200).json({ success: true, message: "Logged out successfully" });
};

export const getLoggedInUser = async (req: any, res: Response) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found!",
      });
    }
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error!",
    });
  }
};
