import mongoose, { Document, Schema, Model } from "mongoose";

// Interface for Division document
export interface IDivision extends Document {
  id: number;
  englishName: string;
  banglaName: string;
  lat?: number;
  long?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// Division schema definition
const DivisionSchema: Schema<IDivision> = new Schema(
  {
    id: {
      type: Number,
      required: true,
      unique: true,
      index: true, // Index for faster queries
    },
    englishName: {
      type: String,
      required: true,
      trim: true, // Remove extra spaces
    },
    banglaName: {
      type: String,
      required: true,
      trim: true,
    },
    lat: {
      type: Number,
      min: -90,
      max: 90,
    },
    long: {
      type: Number,
      min: -180,
      max: 180,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Optional: pre-save hook for sanitization
DivisionSchema.pre<IDivision>("save", function (next) {
  this.englishName = this.englishName.trim();
  this.banglaName = this.banglaName.trim();
  next();
});

// Optional: text index for searching by name
DivisionSchema.index({ englishName: "text", banglaName: "text" });

// Safe model export to avoid recompilation errors
const Division: Model<IDivision> =
  mongoose.models.Division ||
  mongoose.model<IDivision>("Division", DivisionSchema);

export default Division;
