const express = require("express");
const authRouter = express.Router();

const {
  signUpController,
  signInController,
  signOutController,
  requireSignin,
  isAuth,
} = require("../controllers/auth.controller");
const { userSignUpValidator } = require("../helpers/signup.validator");

authRouter.post("/signup", userSignUpValidator, signUpController);
authRouter.post("/signin", signInController);
authRouter.put("/signout", requireSignin, isAuth, signOutController);

module.exports = authRouter;
