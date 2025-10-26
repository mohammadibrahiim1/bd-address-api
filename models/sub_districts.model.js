// models/Upazila.js
const mongoose = require("mongoose");

const subDistrictSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
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
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better performance
subDistrictSchema.index({ id: 1 });
subDistrictSchema.index({ district_id: 1 });
subDistrictSchema.index({ name: "text", bn_name: "text" });

// Virtual for district details
subDistrictSchema.virtual("district", {
  ref: "District",
  localField: "district_id",
  foreignField: "id",
  justOne: true,
});

// Virtual for division details through district
subDistrictSchema.virtual("division", {
  ref: "Division",
  localField: "district.division_id",
  foreignField: "id",
  justOne: true,
});

// Ensure virtual fields are serialized
subDistrictSchema.set("toJSON", { virtuals: true });
subDistrictSchema.set("toObject", { virtuals: true });

const SubDistrict = mongoose.model("Upazila", subDistrictSchema);

module.exports = SubDistrict;
