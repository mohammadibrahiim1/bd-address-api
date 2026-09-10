import { Router } from 'express';
import { createMultipleSubDistricts, getAllSubDistricts } from '../controller/sub-districts.controller';

const router: Router = Router();

// POST: create multiple sub-districts
router.post('/post', createMultipleSubDistricts);

// GET: get all sub-districts with optional filters, pagination, and grouping
router.get('/all', getAllSubDistricts);

// Future route for divisions (uncomment when implemented)
// router.get("/divisions", getDivisions);

export default router;
