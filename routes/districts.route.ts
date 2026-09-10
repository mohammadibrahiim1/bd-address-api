import { Router } from 'express';
import { createDistrict, getDistricts } from '../controller/districts.controller';

const router: Router = Router();

// POST: Create a district or multiple districts
router.post('/post', createDistrict);

// GET: Retrieve all districts (optionally filter by division)
router.get('/all', getDistricts);

export default router;
