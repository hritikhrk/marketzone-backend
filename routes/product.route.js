const express = require("express");
const productRouter = express.Router();

const {
  productByIdController,
  createController,
  readController,
  updateController,
  deleteController,
  filterListController,
  relatedListController,
  listCategoriesController,
  listBySearchController,
  photoController,
  searchByNameController,
} = require("../controllers/product.controller");

const {
  requireSignin,
  isAuth,
  isAdmin,
} = require("../controllers/auth.controller");

// const { userByIdController } = require("../controllers/user.controller");

productRouter.get("/product/view/all", filterListController);
productRouter.get("/product/:productId", readController);
productRouter.post(
  "/admin/product/create",
  requireSignin,
  isAuth,
  isAdmin,
  createController
);
productRouter.put(
  "/admin/product/edit/:productId",
  requireSignin,
  isAuth,
  isAdmin,
  updateController
);
productRouter.delete(
  "/admin/product/delete/:productId",
  requireSignin,
  isAuth,
  isAdmin,
  deleteController
);

productRouter.get("/product/search", searchByNameController);
productRouter.get("/product/related/:productId", relatedListController);
productRouter.get("/product/categories", listCategoriesController);
productRouter.post("/products/by/search", listBySearchController);
productRouter.get("/product/photo/:productId", photoController);

productRouter.param("productId", productByIdController);
// productRouter.param("userId", userByIdController);

module.exports = productRouter;
