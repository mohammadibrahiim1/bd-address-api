import { protect } from "./../middlewares/auth.middleware";
// const express = require("express");
// const {
//   createDivision,
//   getDivisions,
// } = require("../controller/division.controller");
// const router = express.Router();

// //post division
// router.post("/post", createDivision);

// //get divisions
// router.get("/all", getDivisions);

// module.exports = router;

import { Router } from "express";
import {
  createDivision,
  getDivisions,
} from "../controller/division.controller";

const router: Router = Router();

// POST: Create a division or multiple divisions
router.post("/post", createDivision);

// GET: Retrieve all divisions
router.get("/all", protect, getDivisions);

export default router;
