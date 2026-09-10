import { protect } from './../middlewares/auth.middleware';

import { Router } from 'express';
import { createDivision, getDivisions } from '../controller/division.controller';

const router: Router = Router();

// POST: Create a division or multiple divisions
router.post('/post', createDivision);

// GET: Retrieve all divisions
router.get('/all', getDivisions);

export default router;
