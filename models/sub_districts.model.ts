import mongoose, { Document, Schema, Model } from "mongoose";

// Interface for SubDistrict document
export interface ISubDistrict extends Document {
  id: number;
  name: string;
  bn_name: string;
  district_id: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// SubDistrict schema definition
const SubDistrictSchema: Schema<ISubDistrict> = new Schema(
  {
    id: {
      type: Number,
      required: true,
      unique: true,
      index: true, // Faster queries on ID
    },
    name: {
      type: String,
      required: true,
      trim: true,
      index: true, // Optional index
    },
    bn_name: {
      type: String,
      required: true,
      trim: true,
    },
    district_id: {
      type: Number,
      required: true,
      ref: "District",
      index: true,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Text index for search
SubDistrictSchema.index({ name: "text", bn_name: "text" });

// Virtual to populate district details
SubDistrictSchema.virtual("district", {
  ref: "District",
  localField: "district_id",
  foreignField: "id",
  justOne: true,
});

// Virtual to populate division through district
SubDistrictSchema.virtual("division", {
  ref: "Division",
  localField: "district.division_id",
  foreignField: "id",
  justOne: true,
});

// Optional: pre-save hook for security or validation
SubDistrictSchema.pre <
  ISubDistrict >
  ("save",
  function (next) {
    // Example: sanitize strings
    this.name = this.name.trim();
    this.bn_name = this.bn_name.trim();
    next();
  });

// Model creation
const SubDistrict: Model<ISubDistrict> =
  mongoose.models.Upazila ||
  mongoose.model < ISubDistrict > ("Upazila", SubDistrictSchema);

export default SubDistrict;
