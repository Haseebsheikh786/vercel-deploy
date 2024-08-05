
const express = require("express");
const passport = require("passport");

const {
  createProduct,
  fetchAllProducts,
  fetchProductById,
  updateProduct,
} = require("../controller/ProductController");
const validateToken = require("../middleware/ValidateTokenHandler");

const { fetchBrands, createBrand } = require("../controller/BrandController");

const {
  fetchCategories,
  createCategory,
} = require("../controller/CategoryController");

const {
  createUser,
  loginUser,
  checkAuth,
  resetPassword,
  resetPasswordRequest,
  logout,
} = require("../controller/AuthController");

const {
  addToCart,
  fetchCartByUser, 
  deleteFromCart,
  updateCart,
} = require("../controller/CartController");

const {
  createOrder,
  fetchOrdersByUser,
  deleteOrder,
  updateOrder,
  fetchAllOrders,
} = require("../controller/OrderController");

const { fetchUserById, updateUser } = require("../controller/UserController");

const { isAuth } = require("../services/common");

const router = express.Router();

// Product

router
  .post("/products", validateToken, createProduct)
  .get("/products", fetchAllProducts)
  .get("/products/:id", validateToken, fetchProductById)
  .patch("/products/:id", validateToken, updateProduct);

// Brand
router.get("/brands", fetchBrands).post("/brands", createBrand);

// Category
router.get("/categories", fetchCategories).post("/categories", createCategory);

// Auth
router
  .post("/auth/signup", createUser)
  .post("/auth/login", passport.authenticate("local"), loginUser)
  .get("/auth/logout", logout)
  .get("/auth/check", validateToken, checkAuth)
  .post("/auth/reset-password-request", resetPasswordRequest)
  .post("/auth/reset-password", resetPassword);

// User
router
  .get("/users/own", validateToken, fetchUserById)
  .patch("/users/:id", validateToken, updateUser);

// Cart
router
  .post("/cart/", validateToken, addToCart)
  .get("/cart/", validateToken, fetchCartByUser)
  .delete("/cart/:id", validateToken, deleteFromCart)
  .patch("/cart/:id", validateToken, updateCart);

// Order
router
  .post("/orders/", validateToken, createOrder)
  .get("/orders/own", validateToken, fetchOrdersByUser)
  .delete("/orders/:id", validateToken, deleteOrder)
  .patch("/orders/:id", validateToken, updateOrder)
  .get("/orders", validateToken, fetchAllOrders);

module.exports = router;
