const express = require("express");
const {
  createDistrict,
  getDistricts,
} = require("../controller/districts.controller");

const router = express.Router();

//post division
router.post("/post", createDistrict);

//get divisions
router.get("/all", getDistricts);

module.exports = router;
