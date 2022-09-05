const categoryModel = require("../model/category.model");
const { errorHandler } = require("../helpers/dbErrorHandler");

//exports categoryByIdController (to find a category by ID)
exports.categoryByIdController = (req, res, next, id) => {
  categoryModel.findById(id).exec((err, data) => {
    if (err || !data) {
      err.code = 11002;
      err = errorHandler(err);
      console.log(err);
      res.statusCode = 404;
      res.json({ error: "Category not found" });
    }
    req.category = data;
    next();
  });
};

//exports createController (to create a category object)
exports.createController = (req, res) => {
  categoryModel
    .create({ name: req.body.name })
    .then(
      (category) => {
        console.log("Category Created:\n", category);
        res.statusCode = 200; //OK
        res.setHeader("Content-Type", "application/json");
        res.json(category);
      },
      (err) => {
        const error = errorHandler(err);
        console.log(error);
        res.statusCode = 400;
        res.json({ error: error });
      }
    )
    .catch((err) => {
      const error = errorHandler(err);
      console.log(error);
      res.statusCode = 500;
      res.json({ error: error });
    });
};

//exports getListController (to get the list of categories)
exports.getListController = (req, res) => {
  categoryModel.find().exec((err, data) => {
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

//exports readController (to get a category by ID)
exports.readController = (req, res) => {
  res.statusCode = 200;
  res.json(req.category);
};

//exports updateController (to update a category by ID)
exports.updateController = (req, res) => {
  const category = req.category;
  category.name = req.body.name;
  category.save((err, data) => {
    if (err) {
      console.log("Update unsuccessful");
      console.log(err);
      err.message = err._message;
      err.code = 11002;
      return res.status(400).json({ error: errorHandler(err) });
    }
    console.log("Update successful");
    res.statusCode = 200;
    res.json(data);
  });
};

//exports deleteController (to delete a category by ID)
exports.deleteController = (req, res) => {
  const category = req.category;
  category.remove((err, data) => {
    if (err) {
      console.log("Deletion unsuccessful");
      console.log(err);
      err.message = err._message;
      err.code = 11002;
      return res.status(400).json({ error: errorHandler(err) });
    }
    console.log("Deletion successful");
    res.statusCode = 200;
    res.json({ message: "Category deleted" });
  });
};
