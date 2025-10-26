const Division = require("../models/division.model");

// create division
const createDivision = async (req, res) => {
  try {
    const data = req.body;

    if (!data || (Array.isArray(data) && data.length === 0)) {
      return res.status(400).json({
        success: false,
        message: "No data provided to insert.",
      });
    }

    let inserted;

    if (Array.isArray(data)) {
      // Insert multiple divisions
      inserted = await Division.insertMany(data, { ordered: false }); // ordered: false -> continue on error
    } else {
      // Insert single division
      const division = new Division(data);
      inserted = await division.save();
    }

    return res.status(201).json({
      success: true,
      message: Array.isArray(data)
        ? `${inserted.length} divisions created successfully.`
        : "Division created successfully.",
      data: inserted,
    });
  } catch (err) {
    // Handle duplicate key error
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Duplicate entry detected.",
        error: err.keyValue,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: err.message,
    });
  }
};

//get division data
const getDivisions = async (req, res) => {
  try {
    const divisions = await Division.find().sort({
      id: 1,
    });
    res.status(200).json(divisions);
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Failed to fetch divisions", error: error.message });
  }
};

module.exports = {
  createDivision,
  getDivisions,
};
