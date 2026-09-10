import { Router } from 'express';
import { createMultipleUpazilas, getAllUpazilas } from '../controller/sub-districts.controller';

const router: Router = Router();

// POST: create multiple upazilas
router.post('/post', createMultipleUpazilas);

// GET: get all upazilas
router.get('/all', getAllUpazilas);

// Future route for divisions (uncomment when implemented)
// router.get("/divisions", getDivisions);

export default router;
