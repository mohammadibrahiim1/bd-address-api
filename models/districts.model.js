const mongoose = require("mongoose");

const districtSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    bn_name: {
      type: String,
      required: true,
    },
    division_id: {
      type: Number,
      required: true,
    },
    url: {
      type: String,
      required: true,
      unique: true,
    },
    lat: {
      type: Number,
      required: true,
    },
    lon: {
      type: Number,
      required: true,
    },
    is_metro: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
); // optional timestamps

// Export the model
const District = mongoose.model("District", districtSchema);

module.exports = District;
