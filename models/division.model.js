const mongoose = require("mongoose");

const divisionSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true },
    englishName: { type: String, required: true },
    banglaName: { type: String, required: true },
    lat: { type: Number },
    long: { type: Number },
  },
  { timestamps: true }
);

const Division = mongoose.model("Division", divisionSchema);

module.exports = Division;
