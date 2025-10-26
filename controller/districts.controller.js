const District = require("../models/districts.model");

// Dynamic upload controller (single or multiple districts)
const createDistrict = async (req, res) => {
  try {
    const data = req.body;

    if (!data || typeof data !== "object") {
      return res
        .status(400)
        .json({ success: false, message: "Invalid request body" });
    }

    let result;

    if (Array.isArray(data)) {
      // Multiple districts
      result = await District.insertMany(data, { ordered: false });
    } else {
      // Single district
      const district = new District(data);
      result = await district.save();
    }

    res.status(201).json({ success: true, data: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET all districts (optionally filter by division)
const getDistricts = async (req, res) => {
  try {
    const { division_id } = req.query; // optional query param

    let filter = {};
    if (division_id) {
      filter.division_id = Number(division_id);
    }

    const districts = await District.find(filter).sort({ name: 1 }); // A-Z by name
    res.status(200).json({ success: true, data: districts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  createDistrict,
  getDistricts,
};
