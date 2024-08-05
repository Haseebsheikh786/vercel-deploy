const express = require("express");
const passport = require("passport");

const {
  addToCart,
  fetchCartByUser,
  deleteFromCart,
  updateCart,
} = require("../controller/CartController");
const validateToken = require("../middleware/ValidateTokenHandler");

const { isAuth } = require("../services/common");
const router = express.Router();

router.post("/", validateToken, addToCart);
router.get("/", validateToken, fetchCartByUser);
router.delete("/:id", deleteFromCart);
router.post("/:id", validateToken, updateCart);

module.exports = router;
