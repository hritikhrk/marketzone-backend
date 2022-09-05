const express = require("express");
const orderRouter = express.Router();

const {
  requireSignin,
  isAuth,
  isAdmin,
} = require("../controllers/auth.controller");

const {
  userByIdController,
  addOrderToUserHistory,
} = require("../controllers/user.controller");

const {
  createController,
  listOrdersController,
  getStatusValueController,
  orderByIdController,
  updateOrderStatusController,
} = require("../controllers/order.controller");

const {
  decreaseQuantityController,
} = require("../controllers/product.controller");

orderRouter.post(
  "/user/:userId/order/create",
  requireSignin,
  isAuth,
  addOrderToUserHistory,
  decreaseQuantityController,
  createController
);

orderRouter.get(
  "/order/list/:userId",
  requireSignin,
  isAuth,
  isAdmin,
  listOrdersController
);

orderRouter.get(
  "/admin/order/status-values/:userId",
  requireSignin,
  isAuth,
  isAdmin,
  getStatusValueController
);

orderRouter.put(
  "/admin/:userId/order/:orderId/status",
  requireSignin,
  isAuth,
  isAdmin,
  updateOrderStatusController
);

orderRouter.param("userId", userByIdController);
orderRouter.param("orderId", orderByIdController);

module.exports = orderRouter;
