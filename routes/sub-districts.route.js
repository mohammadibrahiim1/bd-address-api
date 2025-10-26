const express = require("express");
const {
  createMultipleUpazilas,
  getAllUpazilas,
} = require("../controller/sub-districts.controller");

const router = express.Router();

//post division
router.post("/post", createMultipleUpazilas);

//get all upazilas
router.get("/all", getAllUpazilas);

//get divisions
// router.get("/all", getDivisions);

module.exports = router;
