const express = require("express");
 
const {
  fetchCategories,
  createCategory,
} = require("../controller/CategoryController");

 const router = express.Router();

router.route("/").post(createCategory);
router.route("/").get(fetchCategories);

module.exports = router;
