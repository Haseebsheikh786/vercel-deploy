const express = require("express");

const {
  createProduct,
  fetchAllProducts,
  fetchProductById,
  updateProduct,
} = require("../controller/ProductController");

// const { isAuth } = require("../services/common");
const validateToken = require("../middleware/ValidateTokenHandler");
const router = express.Router();

router.post("/", createProduct);
router.get("/", fetchAllProducts);
router.get("/:id", validateToken, fetchProductById);
router.patch("/:id", validateToken, updateProduct);

module.exports = router;
