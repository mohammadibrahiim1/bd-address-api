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

// Create multiple upazilas
export const createMultipleUpazilas = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const upazilas: ISubDistrict[] = req.body;

    if (!Array.isArray(upazilas) || upazilas.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Request body must be a non-empty array of upazilas',
      });
    }

    // Validate required fields
    const invalidUpazilas = upazilas
      .map((upazila, index) => {
        const missingFields: string[] = [];
        if (!upazila.id) missingFields.push('id');
        if (!upazila.name) missingFields.push('name');
        if (!upazila.bn_name) missingFields.push('bn_name');
        if (!upazila.district_id) missingFields.push('district_id');
        return missingFields.length ? { index, missingFields } : null;
      })
      .filter(Boolean);

    if (invalidUpazilas.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Some upazilas are missing required fields',
        invalidUpazilas,
      });
    }

    // Check all districts exist
    const districtIds = [...new Set(upazilas.map((u) => u.district_id))];
    const existingDistricts: IDistrict[] = await District.find({
      id: { $in: districtIds },
    });

    if (existingDistricts.length !== districtIds.length) {
      const foundIds = existingDistricts.map((d) => d.id);
      const missingIds = districtIds.filter((id) => !foundIds.includes(id));
      return res.status(400).json({
        success: false,
        message: 'Some districts not found',
        missingDistrictIds: missingIds,
      });
    }

    // Check duplicate IDs in request
    const ids = upazilas.map((u) => u.id);
    if (new Set(ids).size !== ids.length) {
      const duplicateIds = ids.filter((id, idx) => ids.indexOf(id) !== idx);
      return res.status(400).json({
        success: false,
        message: 'Duplicate IDs in request',
        duplicateIds: [...new Set(duplicateIds)],
      });
    }

    // Check duplicate names within same district
    const districtUpazilaMap: Record<string, number> = {};
    const duplicateUpazilas = upazilas.filter((u, idx) => {
      const key = `${u.district_id}-${u.name}`;
      if (districtUpazilaMap[key] !== undefined) return true;
      districtUpazilaMap[key] = idx;
      return false;
    });

    if (duplicateUpazilas.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Duplicate upazila names within the same district',
        duplicateUpazilas,
      });
    }

    // Check existing upazilas in DB
    const existingUpazilas = await SubDistrict.find({
      $or: [
        { id: { $in: ids } },
        {
          $and: [{ district_id: { $in: districtIds } }, { name: { $in: upazilas.map((u) => u.name) } }],
        },
      ],
    });

    if (existingUpazilas.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Some upazilas already exist in database',
        conflicts: existingUpazilas.map((existing) => {
          const conflicting = upazilas.find(
            (u) => u.id === existing.id || (u.district_id === existing.district_id && u.name === existing.name),
          );
          return { existing, conflicting };
        }),
      });
    }

    // Insert into database
    const createdUpazilas = await SubDistrict.insertMany(
      upazilas.map((u) => ({
        ...u,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
    );

    res.status(201).json({
      success: true,
      message: `${createdUpazilas.length} upazilas created successfully`,
      data: createdUpazilas,
    });
  } catch (error: unknown) {
    console.error('Error creating upazilas:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating upazilas',
      error: error instanceof Error ? error.message : error,
      stack: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined,
    });
  }
};

// Get all upazilas with optional filters, pagination, and grouping
export const getAllUpazilas = async (req: Request<{}, {}, {}, UpazilaQuery>, res: Response, next: NextFunction) => {
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
      message: 'Upazilas retrieved successfully',
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
