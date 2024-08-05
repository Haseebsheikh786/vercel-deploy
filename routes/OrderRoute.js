const express = require("express");
const passport = require("passport");

const {
  createOrder,
  fetchOrdersByUser,
  deleteOrder,
  updateOrder,
  fetchAllOrders,
} = require("../controller/OrderController");
const { isAuth } = require("../services/common");
const validateToken = require("../middleware/ValidateTokenHandler");
const router = express.Router();
router.post("/", createOrder);
router.get("/own/:id", fetchOrdersByUser);
router.get("/", fetchAllOrders);
router.delete("/:id", validateToken, deleteOrder);
router.patch("/:id", validateToken, updateOrder);

module.exports = router;
