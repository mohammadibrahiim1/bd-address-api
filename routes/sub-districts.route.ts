// const express = require("express");
// const {
//   createMultipleUpazilas,
//   getAllUpazilas,
// } = require("../controller/sub-districts.controller");

// const router = express.Router();

// //post division
// router.post("/post", createMultipleUpazilas);

// //get all upazilas
// router.get("/all", getAllUpazilas);

// //get divisions
// // router.get("/all", getDivisions);

// module.exports = router;

import { Router } from "express";
import {
  createMultipleUpazilas,
  getAllUpazilas,
} from "../controller/sub-districts.controller";

const router: Router = Router();

// POST: create multiple upazilas
router.post("/post", createMultipleUpazilas);

// GET: get all upazilas
router.get("/all", getAllUpazilas);

// Future route for divisions (uncomment when implemented)
// router.get("/divisions", getDivisions);

export default router;
