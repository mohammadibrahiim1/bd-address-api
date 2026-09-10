import { Request, Response, NextFunction } from 'express';
import District, { IDistrict } from '../models/districts.model';
// import District, { IDistrict } from "../models/District.model";

// Create single or multiple districts
export const createDistrict = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data: IDistrict | IDistrict[] = req.body;

    // Validate request body
    if (!data || typeof data !== 'object' || (Array.isArray(data) && data.length === 0)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request body: must provide a district object or array of districts',
      });
    }

    let result: IDistrict | IDistrict[];

    if (Array.isArray(data)) {
      // Insert multiple districts
      result = await District.insertMany(data, { ordered: false }); // continue inserting if some fail
    } else {
      // Insert single district
      const district = new District(data);
      result = await district.save();
    }

    return res.status(201).json({
      success: true,
      message: Array.isArray(data)
        ? `${(result as IDistrict[]).length} districts created successfully.`
        : 'District created successfully.',
      data: result,
    });
  } catch (err: unknown) {
    // Handle duplicate key error
    if (err instanceof Error && 'code' in err && (err as any).code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Duplicate entry detected',
        error: (err as any).keyValue,
      });
    }

    console.error('Error creating district:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: err instanceof Error ? err.message : err,
      stack: process.env.NODE_ENV === 'development' && err instanceof Error ? err.stack : undefined,
    });
  }
};

// Get all districts (optional filtering by division)
export const getDistricts = async (
  req: Request<{}, {}, {}, { division_id?: string | number }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { division_id } = req.query;
    const filter: Partial<IDistrict> = {};

    if (division_id) {
      const divisionIdNum = Number(division_id);
      if (isNaN(divisionIdNum)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid division_id query parameter',
        });
      }
      filter.division_id = divisionIdNum;
    }

    // Fetch districts from DB sorted by ID ascending
    const districts = await District.find().sort({ id: 1 });

    return res.status(200).json({
      success: true,
      message: 'Districts retrieved successfully',
      data: districts,
    });
  } catch (err: unknown) {
    console.error('Error fetching districts:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch districts',
      error: err instanceof Error ? err.message : err,
      stack: process.env.NODE_ENV === 'development' && err instanceof Error ? err.stack : undefined,
    });
  }
};
