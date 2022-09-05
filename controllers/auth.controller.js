const jwt = require("jsonwebtoken");
const { expressjwt: expressJwt } = require("express-jwt");
const { validationResult } = require("express-validator");
const { errorHandler } = require("../helpers/dbErrorHandler");
const userModel = require("../model/user.model");
const { JWT_SECRET_KEY } = require("../config");

exports.signUpController = (req, res) => {
  const user = new userModel({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    about: req.body.about,
  });
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const firstError = errors.array().map((error) => error.msg)[0];
    return res.status(422).json({ error: firstError });
  }
  console.log(user);
  user.save((err, user) => {
    if (err) {
      const errorMessage = errorHandler(err);
      console.log(errorMessage);
      return res.status(500).json({ error: errorMessage });
    }
    console.log("SignUp successful.");
    console.log(user);
    res.status(200).json({ user });
  });
};

exports.signInController = (req, res) => {
  const { email, password } = req.body;
  userModel.findOne({ email }, (err, user) => {
    if (err || !user) {
      console.log("SignIn unsuccessful.");
      console.log("User with that email doesn't exit.");
      return res.status(400).json({
        error: "User with that email doesn't exist. Please signup.",
      });
    }

    //if user found make sure the email and password match using the authenticate method in user model
    if (!user.authenticate(password)) {
      console.log("Email and password didn't match.");
      return res.status(401).json({
        error: "Email and password didn't match.",
      });
    }

    //generate a signed token with user id and secret key
    const token = jwt.sign({ _id: user._id }, JWT_SECRET_KEY, {
      expiresIn: "7d",
    });
    const userDetails = {
      _id: user._id,
      name: user.name,
      email: user.email,
    };
    console.log("SignIn successful.");
    console.log("Signed In User Details: \n", userDetails);
    return res.status(200).json({
      token,
      user: userDetails,
    });
  });
};

exports.signOutController = (req, res) => {
  const authHeader = req.headers["authorization"];
  jwt.sign(authHeader, "", { expiresIn: 1 }, (logout, err) => {
    if (err) {
      console.log("Logout Error");
      return res.status(500).json({ error: "Logout Error" });
    }
    console.log("You have been Signed Out.");
    return res.status(200).json({ status: "You have been Signed Out." });
  });
};

exports.requireSignin = expressJwt({
  secret: JWT_SECRET_KEY,
  algorithms: ["HS256"],
});

exports.isAuth = (req, res, next) => {
  try {
    // Extracting token from authorization in header and splitting it as Bearer and token id
    const token = req.headers.authorization.split(" ");
    // Verifying the extracted token id with the secret key
    const user = jwt.verify(token[1], JWT_SECRET_KEY);
    if (token[0] === "Bearer" && user) {
      req.user = user;
      // console.log(user);
      next();
    }
  } catch (err) {
    console.log("User not signed in.");
    console.log(err);
    return res.status(401).json({
      errorDetails: "You are not signed in. Please login to continue",
    });
  }
};

exports.isAdmin = (req, res, next) => {
  const id = req.user._id;
  userModel.findById(id).exec((err, user) => {
    if (err || !user) {
      // if user not found
      return res.status(404).json({
        error: "User doesn't exist.",
      });
    } else {
      // check if user is admin or not
      if (!(user.otherDetails.isAdmin === true)) {
        console.log("You are not an admin. Access Denied.");
        return res.status(403).json({
          error: "You are not an admin.",
        });
      } else {
        next();
      }
    }
  });
};
