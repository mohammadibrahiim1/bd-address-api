// const express = require("express");
// const {
//   createDistrict,
//   getDistricts,
// } = require("../controller/districts.controller");

// const router = express.Router();

// //post division
// router.post("/post", createDistrict);

// //get divisions
// router.get("/all", getDistricts);

// module.exports = router;

import { Router } from "express";
import {
  createDistrict,
  getDistricts,
} from "../controller/districts.controller";
// import {
//   createDistrict,
//   getDistricts,
// } from "../controller/district.controller";

const router: Router = Router();

// POST: Create a district or multiple districts
router.post("/post", createDistrict);

// GET: Retrieve all districts (optionally filter by division)
router.get("/all", getDistricts);

export default router;
