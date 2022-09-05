const userModel = require("../model/user.model");
const { errorHandler } = require("../helpers/dbErrorHandler");
const _ = require("lodash");
const { orderModel } = require("../model/order.model");

exports.userByIdController = (req, res, next, id) => {
  try {
    userModel.findById(id).exec((err, user) => {
      if (err || !user) {
        console.log("User doesn't exit.");
        return res.status(404).json({
          error: "User with that email doesn't exist. Please signup.",
        });
      }
      req.profile = user;
      next();
    });
  } catch (err) {
    return res.status(400).json({ error: "Something went wrong" });
  }
};

exports.readController = (req, res) => {
  const user = {
    id: req.profile._id,
    name: req.profile.name,
    email: req.profile.email,
    about: req.profile.about,
    history: req.profile.history,
  };
  console.log("User Profile read success.");
  return res.status(200).json(user);
};

exports.updateController = (req, res) => {
  const updatedFields = { about: req.body.about };
  let user = req.profile;
  user = _.extend(user, updatedFields);
  user.save((err, data) => {
    if (err) {
      console.log("Update unsuccessful");
      console.log(err);
      err.message = err._message;
      err.code = 11002;
      return res.status(400).json({ error: errorHandler(err) });
    }
    const updatedUser = {
      _id: data._id,
      name: data.name,
      email: data.email,
      about: data.about,
    };
    console.log("Update successful");
    return res.status(200).json(updatedUser);
  });
};

exports.addOrderToUserHistory = (req, res, next) => {
  let history = [];
  req.body.order.products.forEach((item) => {
    history.push({
      _id: item._id,
      name: item.name,
      description: item.description,
      category: item.category,
      quantity: item.count,
      transaction_id: req.body.order.transaction_id,
      amount: req.body.order.amount,
    });
  });

  userModel.findOneAndUpdate(
    { _id: req.profile._id },
    { $push: { history: history } },
    { new: true },
    (err, data) => {
      if (err) {
        console.log("Could not update user purchase history");
        return res.status(400).json({
          error: "Could not update user purchase history",
        });
      }
      next();
    }
  );
};

exports.purchaseHistoryController = (req, res) => {
  orderModel
    .find({ user: req.profile._id })
    .populate("user", "_id name")
    .sort("-created")
    .exec((err, orders) => {
      if (err) {
        console.log("puchase history listing failed");
        return res.status(400).json({
          error: errorHandler(err),
        });
      }
      console.log("purchase history listin success");
      return res.status(200).json(orders);
    });
};

exports.getListController = (req, res) => {
  userModel.find().exec((err, data) => {
    if (err) {
      const error = errorHandler(err);
      console.log(error);
      res.statusCode = 400;
      res.json({ error: error });
    } else {
      console.log("Data Fetched successfully");
      res.statusCode = 200;
      res.json(data);
    }
  });
};

// add update user profile by admin logic
exports.updateUserByAdminController = (req, res) => {
  const updatedFields = req.body;
  let user = req.profile;
  user = _.extend(user, updatedFields);
  user.save((err, data) => {
    if (err) {
      console.log("Update unsuccessful");
      console.log(err);
      err.message = err._message;
      err.code = 11002;
      return res.status(400).json({ error: errorHandler(err) });
    }
    console.log("Update successful");
    return res.status(200).json(data);
  });
};
