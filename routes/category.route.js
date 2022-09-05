const express = require("express");
const categoryRouter = express.Router();

const {
  getListController,
  readController,
  createController,
  updateController,
  deleteController,
  categoryByIdController,
} = require("../controllers/category.controller");

const {
  requireSignin,
  isAuth,
  isAdmin,
} = require("../controllers/auth.controller");

// const { userByIdController } = require("../controllers/user.controller");

categoryRouter.get("/category/view/all", getListController);

categoryRouter.get("/category/:Id", readController);

categoryRouter.post(
  "/admin/category/create",
  requireSignin,
  isAuth,
  isAdmin,
  createController
);

categoryRouter.put(
  "/admin/category/edit/:Id",
  requireSignin,
  isAuth,
  isAdmin,
  updateController
);

categoryRouter.delete(
  "/admin/category/delete/:Id",
  requireSignin,
  isAuth,
  isAdmin,
  deleteController
);

categoryRouter.param("Id", categoryByIdController);
// categoryRouter.param("userId", userByIdController);

//export categoryRouter
module.exports = categoryRouter;
