const { orderModel, cartItemModel } = require("../model/order.model");
const { errorHandler } = require("../helpers/dbErrorHandler");

exports.orderByIdController = (req, res, next, id) => {
  orderModel
    .findById(id)
    .populate("products.product", "name price")
    .exec((err, order) => {
      if (err || !order) {
        console.log("Error in orderHistory");
        return res.status(400).json({
          error: errorHandled(err),
        });
      }
      req.order = order;
      next();
    });
};

exports.createController = (re, res) => {
  req.body.order.user = req.profile;
  const order = new orderModel(req.body.order);
  order.save((err, data) => {
    if (err) {
      console.log("Order creation failed.");
      return res.status(400).json({
        error: errorHandler(err),
      });
    }
    console.log("Order created successfully.");
    return res.status(200).json(data);
  });
};

exports.listOrdersController = (req, res) => {
  orderModel
    .find()
    .populate("user", "_id name address")
    .sort("-created")
    .exec((err, orders) => {
      if (err) {
        console.log("Orders listings failed.");
        return res.status(400).json({
          error: errorHandler(err),
        });
      }
      console.log("Orders listing success.");
      res.status(200).json(orders);
    });
};

exports.getStatusValueController = (req, res) => {
  return res.json(orderModel.schema.path('status').enumValues)
}

exports.updateOrderStatusController = (req, res) => {
  const updatedFields = { status: req.body.status };
  let order = req.order;
  order = _.extend(order, updatedFields);
  user.save((err, data) => {
    if (err) {
      console.log("Update order status unsuccessful");
      console.log(err);
      err.message = err._message;
      err.code = 11002;
      return res.status(400).json({ error: errorHandler(err) });
    }
    console.log("Update order status successful");
    res.statusCode = 200;
    res.json(data);
  });
}