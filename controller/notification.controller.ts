import mongoose, { Types } from "mongoose";
import {
  Notification,
  NotificationType,
  UserRole,
} from "../models/notification.model";
import { Request, Response } from "express";

export const getAllNotifications = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    const userRole = req.user?.role;

    // Only admins can see notifications
    if (userRole !== UserRole.ADMIN) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only admins can view notifications.",
      });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const notifications = await Notification.find({
      followingUser: userId,
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Notification.countDocuments({ followingUser: userId });

    const totalPages = Math.ceil(total / limit);

    const countsRaw = await Notification.aggregate([
      {
        $match: { followingUser: new mongoose.Types.ObjectId(userId) },
      },
      {
        $group: {
          _id: "$notificationType",
          count: { $sum: 1 },
        },
      },
    ]);

    const counts: Record<string, number> = {};
    Object.values(NotificationType).forEach((type) => {
      counts[type] = 0;
    });
    countsRaw.forEach((item) => {
      counts[item._id] = item.count;
    });

    return res.status(200).json({
      success: true,
      page,
      limit,
      total,
      totalPages,
      notifications,
      counts,
    });
  } catch (error: any) {
    console.log("Error fetching notifications:", error);
    return res.status(500).json({
      success: false,
      message: error?.message || "Internal server error",
    });
  }
};
