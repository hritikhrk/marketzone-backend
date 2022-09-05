const express = require("express");
const userRouter = express.Router();

const {
  requireSignin,
  isAuth,
  isAdmin,
} = require("../controllers/auth.controller");

const {
  getListController,
  readController,
  updateController,
  userByIdController,
  purchaseHistoryController,
  updateUserByAdminController,
} = require("../controllers/user.controller");

userRouter.get("/user/:userId", requireSignin, isAuth, readController);
userRouter.put("/user/:userId/edit", requireSignin, isAuth, updateController);
userRouter.get('/user/:userId/orders', requireSignin, isAuth, purchaseHistoryController)
userRouter.get('/admin/user/view/all', requireSignin, isAuth, isAdmin, getListController)
userRouter.put('/admin/user/:userId/edit', requireSignin, isAuth, isAdmin, updateUserByAdminController)

userRouter.param('userId', userByIdController)

module.exports = userRouter;
