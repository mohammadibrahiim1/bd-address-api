import { Request, Response, NextFunction } from 'express';
import District, { IDistrict } from '../models/districts.model';
import SubDistrict, { ISubDistrict } from '../models/sub_districts.model';

// Utility type for query params
interface UpazilaQuery {
  page?: string | number;
  limit?: string | number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  district_id?: string | number;
  fields?: string;
  groupByDistrict?: string;
}

// Create multiple sub-districts  in bulk
export const createMultipleSubDistricts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const subDistricts: ISubDistrict[] = req.body;

    if (!Array.isArray(subDistricts) || subDistricts.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Request body must be a non-empty array of sub-districts',
      });
    }

    // Validate required fields
    const invalidSubDistricts = subDistricts
      .map((subDistrict, index) => {
        const missingFields: string[] = [];
        if (!subDistrict.id) missingFields.push('id');
        if (!subDistrict.name) missingFields.push('name');
        if (!subDistrict.bn_name) missingFields.push('bn_name');
        if (!subDistrict.district_id) missingFields.push('district_id');
        return missingFields.length ? { index, missingFields } : null;
      })
      .filter(Boolean);

    if (invalidSubDistricts.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Some sub-districts are missing required fields',
        invalidSubDistricts,
      });
    }

    // Check all districts exist
    const districtIds = [...new Set(subDistricts.map((s) => s.district_id))];
    const existingDistricts: IDistrict[] = await District.find({
      id: { $in: districtIds },
    });

    if (existingDistricts.length !== districtIds.length) {
      const foundIds = existingDistricts.map((d) => d.id);
      const missingIds = districtIds.filter((id) => !foundIds.includes(id));
      return res.status(400).json({
        success: false,
        message: 'Some districts not found in database',
        missingDistrictIds: missingIds,
      });
    }

    // Check duplicate IDs in request
    const ids = subDistricts.map((s) => s.id);
    if (new Set(ids).size !== ids.length) {
      const duplicateIds = ids.filter((id, idx) => ids.indexOf(id) !== idx);
      return res.status(400).json({
        success: false,
        message: 'Duplicate IDs found in request body',
        duplicateIds: [...new Set(duplicateIds)],
      });
    }

    // Check duplicate names within same district
    const districtSubDistrictMap: Record<string, number> = {};
    const duplicateSubDistricts = subDistricts.filter((s, idx) => {
      const key = `${s.district_id}-${s.name}`;
      if (districtSubDistrictMap[key] !== undefined) return true;
      districtSubDistrictMap[key] = idx;
      return false;
    });

    if (duplicateSubDistricts.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Duplicate sub-district names within the same district',
        duplicateSubDistricts,
      });
    }

    // Check existing sub-districts in DB
    const existingSubDistricts = await SubDistrict.find({
      $or: [
        { id: { $in: ids } },
        {
          $and: [{ district_id: { $in: districtIds } }, { name: { $in: subDistricts.map((s) => s.name) } }],
        },
      ],
    });

    if (existingSubDistricts.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Some sub-districts already exist in database',
        conflicts: existingSubDistricts.map((existing) => {
          const conflicting = subDistricts.find(
            (s) => s.id === existing.id || (s.district_id === existing.district_id && s.name === existing.name),
          );
          return { existing, conflicting };
        }),
      });
    }

    // Insert into database
    const createdSubDistricts = await SubDistrict.insertMany(
      subDistricts.map((s) => ({
        ...s,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
    );

    res.status(201).json({
      success: true,
      message: `${createdSubDistricts.length} sub-districts created successfully`,
      data: createdSubDistricts,
    });
  } catch (error: unknown) {
    console.error('Error creating sub-districts:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating sub-districts',
      error: error instanceof Error ? error.message : error,
      stack: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined,
    });
  }
};

// Get all sub districts with optional filters, pagination, and grouping
export const getAllSubDistricts = async (req: Request<{}, {}, {}, UpazilaQuery>, res: Response, next: NextFunction) => {
  try {
    const {
      page = 1,
      limit = 495,
      sortBy = 'id',
      sortOrder = 'asc',
      search,
      district_id,
      fields,
      groupByDistrict,
    } = req.query;

    const match: Record<string, any> = {};

    if (search) {
      match.$or = [{ name: { $regex: search, $options: 'i' } }, { bn_name: { $regex: search, $options: 'i' } }];
    }

    if (district_id) {
      match.district_id = parseInt(district_id.toString());
    }

    if (groupByDistrict === 'true') {
      const results = await SubDistrict.aggregate([
        { $match: match },
        {
          $group: {
            _id: '$district_id',
            total_upazilas: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
        { $skip: (Number(page) - 1) * Number(limit) },
        { $limit: Number(limit) },
      ]);

      const totalGroups = await SubDistrict.aggregate([
        { $match: match },
        { $group: { _id: '$district_id' } },
        { $count: 'count' },
      ]);

      return res.status(200).json({
        success: true,
        message: 'Upazila counts by district retrieved successfully',
        data: results.map((r) => ({
          district_id: r._id,
          upazila_count: r.total_upazilas,
        })),
        pagination: {
          current: Number(page),
          total: totalGroups[0]?.count || 0,
          pageSize: Number(limit),
        },
      });
    }

    // Normal list
    const sort: Record<string, 1 | -1> = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    let selectFields = '';
    if (fields) selectFields = fields.split(',').join(' ');

    const upazilas = await SubDistrict.find(match)
      .select(selectFields)
      .sort(sort)
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await SubDistrict.countDocuments(match);

    res.status(200).json({
      success: true,
      message: 'Sub districts retrieved successfully',
      data: upazilas,
      pagination: {
        current: Number(page),
        total: Math.ceil(total / Number(limit)),
        pageSize: Number(limit),
        totalCount: total,
      },
    });
  } catch (error: unknown) {
    console.error('Error fetching upazilas:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching upazilas',
      error: error instanceof Error ? error.message : error,
    });
  }
};
