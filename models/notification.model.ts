import { Schema, model, Document, Types } from "mongoose";

// ------------------------
// ENUMS
// ------------------------

export enum NotificationType {
  PAYMENT = "payment",
  CLASS = "class",
  DUTY = "duty",
  LOAN = "loan",
  STATUS_UPDATE = "status_update",
  TASK = "task",
}

export enum NotificationStatus {
  PENDING = "pending",
  APPROVE = "approve",
  CANCEL = "cancel",
}

export enum UserRole {
  EMPLOYEE = "employee",
  TEACHER = "teacher",
  NURSING = "nursing",
  ADMIN = "admin",
}

// ------------------------
// INTERFACE
// ------------------------

export interface INotification extends Document {
  user?: Types.ObjectId;
  followingUser?: Types.ObjectId;
  notificationType: NotificationType;
  targetId: Types.ObjectId;
  message: string;
  role?: UserRole;
  phone?: string;
  status: NotificationStatus;
  isSeen: boolean;
  createdAt: Date;
}

// ------------------------
// SCHEMA
// ------------------------

const notificationSchema = new Schema<INotification>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    followingUser: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    notificationType: {
      type: String,
      enum: Object.values(NotificationType),
      required: true,
    },

    targetId: {
      type: Schema.Types.ObjectId,
      refPath: "notificationType", // dynamic reference
      required: true,
    },

    message: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: Object.values(UserRole),
    },

    phone: {
      type: String,
    },

    status: {
      type: String,
      enum: Object.values(NotificationStatus),
      default: NotificationStatus.PENDING,
    },

    isSeen: {
      type: Boolean,
      default: false,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    versionKey: false,
  }
);

// ------------------------
// MODEL
// ------------------------

export const Notification = model<INotification>(
  "Notification",
  notificationSchema
);
