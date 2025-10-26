const express = require("express");
const {
  createDivision,
  getDivisions,
} = require("../controller/division.controller");
const router = express.Router();

//post division
router.post("/post", createDivision);

//get divisions
router.get("/all", getDivisions);

module.exports = router;
