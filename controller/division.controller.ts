// const Division = require("../models/division.model");

// // create division
// const createDivision = async (req, res) => {
//   try {
//     const data = req.body;

//     if (!data || (Array.isArray(data) && data.length === 0)) {
//       return res.status(400).json({
//         success: false,
//         message: "No data provided to insert.",
//       });
//     }

//     let inserted;

//     if (Array.isArray(data)) {
//       // Insert multiple divisions
//       inserted = await Division.insertMany(data, { ordered: false }); // ordered: false -> continue on error
//     } else {
//       // Insert single division
//       const division = new Division(data);
//       inserted = await division.save();
//     }

//     return res.status(201).json({
//       success: true,
//       message: Array.isArray(data)
//         ? `${inserted.length} divisions created successfully.`
//         : "Division created successfully.",
//       data: inserted,
//     });
//   } catch (err) {
//     // Handle duplicate key error
//     if (err.code === 11000) {
//       return res.status(400).json({
//         success: false,
//         message: "Duplicate entry detected.",
//         error: err.keyValue,
//       });
//     }

//     return res.status(500).json({
//       success: false,
//       message: "Internal Server Error",
//       error: err.message,
//     });
//   }
// };

// //get division data
// const getDivisions = async (req, res) => {
//   try {
//     const divisions = await Division.find().sort({
//       id: 1,
//     });
//     res.status(200).json(divisions);
//   } catch (error) {
//     console.log(error);
//     res
//       .status(500)
//       .json({ message: "Failed to fetch divisions", error: error.message });
//   }
// };

// module.exports = {
//   createDivision,
//   getDivisions,
// };

import { Request, Response, NextFunction } from "express";
import Division, { IDivision } from "../models/division.model";
// import Division, { IDivision } from "../models/Division.model";

// Create Division(s)
export const createDivision = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data: IDivision | IDivision[] = req.body;

    if (!data || (Array.isArray(data) && data.length === 0)) {
      return res.status(400).json({
        success: false,
        message: "No data provided to insert.",
      });
    }

    let inserted: IDivision | IDivision[];

    if (Array.isArray(data)) {
      // Insert multiple divisions
      inserted = await Division.insertMany(data, { ordered: false }); // Continue on error
    } else {
      // Insert single division
      const division = new Division(data);
      inserted = await division.save();
    }

    return res.status(201).json({
      success: true,
      message: Array.isArray(data)
        ? `${(inserted as IDivision[]).length} divisions created successfully.`
        : "Division created successfully.",
      data: inserted,
    });
  } catch (err: unknown) {
    // Handle duplicate key error
    if (err instanceof Error && "code" in err && (err as any).code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Duplicate entry detected.",
        error: (err as any).keyValue,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: err instanceof Error ? err.message : err,
      stack:
        process.env.NODE_ENV === "development" && err instanceof Error
          ? err.stack
          : undefined,
    });
  }
};

// Get all divisions
export const getDivisions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const divisions: IDivision[] = await Division.find().sort({ id: 1 });
    return res.status(200).json({
      success: true,
      message: "Divisions retrieved successfully",
      data: divisions,
    });
  } catch (err: unknown) {
    console.log("Failed to fetch divisions:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch divisions",
      error: err instanceof Error ? err.message : err,
    });
  }
};
