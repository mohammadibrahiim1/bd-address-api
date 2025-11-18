import mongoose, { Document, Schema, Model } from "mongoose";

// Interface for District document
export interface IDistrict extends Document {
  id: number;
  name: string;
  bn_name: string;
  division_id: number;
  url: string;
  lat: number;
  lon: number;
  is_metro?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// District schema definition
const DistrictSchema: Schema<IDistrict> = new Schema(
  {
    id: {
      type: Number,
      required: true,
      unique: true,
      index: true, // index for fast queries
    },
    name: {
      type: String,
      required: true,
      trim: true, // remove extra spaces
    },
    bn_name: {
      type: String,
      required: true,
      trim: true,
    },
    division_id: {
      type: Number,
      required: true,
      ref: "Division",
      index: true,
    },
    url: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      match: /^https?:\/\/[^\s$.?#].[^\s]*$/, // simple URL validation
    },
    lat: {
      type: Number,
      required: true,
      min: -90,
      max: 90,
    },
    lon: {
      type: Number,
      required: true,
      min: -180,
      max: 180,
    },
    is_metro: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // createdAt and updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Optional: text index for search
DistrictSchema.index({ name: "text", bn_name: "text" });

// Pre-save hook for sanitization
DistrictSchema.pre<IDistrict>("save", function (next) {
  this.name = this.name.trim();
  this.bn_name = this.bn_name.trim();
  this.url = this.url.trim();
  next();
});

// Safe model export to prevent recompilation errors
const District: Model<IDistrict> =
  mongoose.models.District ||
  mongoose.model<IDistrict>("District", DistrictSchema);

export default District;
