const express = require("express");

const { fetchBrands, createBrand } = require("../controller/BrandController");

const router = express.Router();

router.get("/", fetchBrands);
router.post("/", createBrand);

module.exports = router;
