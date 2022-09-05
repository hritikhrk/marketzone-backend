const _ = require("lodash");
const fs = require("fs");
const formidable = require("formidable");
const productModel = require("../model/product.model");
const { errorHandler } = require("../helpers/dbErrorHandler");

exports.productByIdController = (req, res, next, id) => {
  try {
    productModel
      .findById(id)
      .populate("category")
      .exec((err, product) => {
        if (err || !product) {
          console.log("Product not found.");
          return res.status(404).json({
            error: "Product not found.",
          });
        }
        req.product = product;
        next();
      });
  } catch (err) {
    return res.status(400).json({ error: "Something went wrong" });
  }
};

exports.readController = (req, res) => {
  req.product.photo = undefined;
  console.log("Product read success.");
  console.log(req.product);
  return res.status(200).json(user);
};

exports.createController = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;
  form.maxFieldsSize = 1024 * 1024; // <1MB
  form.parse(req, (err, fields, files) => {
    if (err) {
      return res.status(400).json({ error: "Image could not be uploaded." });
    }
    //check all fields
    const { name, description, price, category, quantity, shipping } = fields;
    if (
      !name ||
      !description ||
      !price ||
      !category ||
      !quantity ||
      !shipping
    ) {
      console.log("All fields are required.");
      return res.status(400).json({
        error: "All fields are required.",
      });
    }

    let product = new productModel(fields);

    // 1kb = 1000
    // 1mb = 1000000

    if (files.photo) {
      // console.log("FILES PHOTO: ", files.photo);
      if (files.photo.size > 1000000) {
        console.log("Image should be less than 1mb in size");
        return res.status(400).json({
          error: "Image should be less than 1mb in size",
        });
      }
      console.log(files.photo.filepath)
      product.photo.data = fs.readFileSync(files.photo.filepath);
      product.photo.contentType = files.photo.type;
    }

    product.save((err, result) => {
      if (err) {
        console.log("PRODUCT CREATE ERROR ", err);
        return res.status(400).json({
          error: errorHandler(err),
        });
      }
      res.json(result);
    });
  });
};

exports.deleteController = (req, res) => {
  let product = req.product;
  product.remove((err, deletedProduct) => {
    if (err) {
      console.log("Deletion unsuccessful");
      console.log(err);
      err.message = err._message;
      err.code = 11002;
      return res.status(400).json({ error: errorHandler(err) });
    }
    console.log("Deletion successful");
    res.statusCode = 200;
    res.json({ message: "Product deleted" });
  });
};

exports.updateController = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;
  form.parse(req, (err, fields, files) => {
    if (err) {
      return res.status(400).json({
        error: "Image could not be uploaded",
      });
    }

    let product = req.product;
    product = _.extend(product, fields);

    // 1kb = 1000
    // 1mb = 1000000

    if (files.photo) {
      // console.log("FILES PHOTO: ", files.photo);
      if (files.photo.size > 1000000) {
        return res.status(400).json({
          error: "Image should be less than 1mb in size",
        });
      }
      product.photo.data = fs.readFileSync(files.photo.path);
      product.photo.contentType = files.photo.type;
    }

    product.save((err, result) => {
      if (err) {
        return res.status(400).json({
          error: errorHandler(err),
        });
      }
      console.log("Product updated successfully.");
      res.status(200).json(result);
    });
  });
};

/**
 * sell / arrival
 * by sell = /products?sortBy=sold&order=desc&limit=4
 * by arrival = /products?sortBy=createdAt&order=desc&limit=4
 * if no params are sent, then all products are returned
 */

exports.filterListController = (req, res) => {
  let order = req.query.order ? req.query.order : "asc";
  let sortBy = req.query.sortBy ? req.query.sortBy : "_id";
  let limit = req.query.limit ? parseInt(req.query.limit) : 6;

  productModel
    .find()
    .select("-photo")
    .populate("category")
    .sort([[sortBy, order]])
    .limit(limit)
    .exec((err, products) => {
      if (err) {
        console.log("Products not found");
        return res.status(400).json({
          error: "Products not found.",
        });
      }
      console.log("Product list fetched successfully.");
      return res.status(200).json(products);
    });
};

/**
 * it will find the products based on the req product category
 * other products that has the same category, will be returned
 */
exports.relatedListController = (req, res) => {
  let limit = req.query.limit ? req.query.limit : 6;

  //$ne = not equal
  productModel
    .find({ _id: { $ne: req.product._id }, category: req.product.category })
    .limit(limit)
    .populate("category", "_id name")
    .exec((err, products) => {
      if (err) {
        console.log("Related products not found");
        return res.status(400).json({
          error: "Related product not found.",
        });
      }
      console.log("Related product list fetched successfully.");
      return res.status(200).json(products);
    });
};

exports.listCategoriesController = (req, res) => {
  productModel.distinct("category", {}, (err, categories) => {
    if (err) {
      const error = errorHandler(err);
      console.log(error);
      return res.status(400).json({ error: error });
    } else {
      console.log("Data Fetched successfully");
      return res.status(200).json(categories);
    }
  });
};

/**
 * list products by search
 * we will implement product search in react frontend
 * we will show categories in checkbox and price range in radio buttons
 * as the user clicks on those checkbox and radio buttons
 * we will make api request and show the products to users based on what he wants
 */
exports.listBySearchController = (req, res) => {
  let order = req.body.order ? req.body.order : "desc";
  let sortBy = req.body.sortBy ? req.body.sortBy : "_id";
  let limit = req.body.limit ? parseInt(req.body.limit) : 100;
  let skip = parseInt(req.body.skip);
  let findArgs = {};

  for (let key in req.body.filters) {
    if (req.body.filters[key].length > 0) {
      if (key === "price") {
        findArgs[key] = {
          $gte: req.body.filters[key][0],
          $lte: req.body.filters[key][1],
        };
      } else {
        findArgs[key] = req.body.filters[key];
      }
    }
  }

  productModel
    .find(findArgs)
    .select("-photo")
    .populate("category")
    .sort([[sortBy, order]])
    .skip(skip)
    .limit(limit)
    .exec((err, data) => {
      if (err) {
        console.log("Searched product not found.");
        return res.status(400).json({
          error: "Searched product not found",
        });
      }
      console.log("Searched product data fetched successfully.");
      res.status(200).json({
        size: data.length,
        data,
      });
    });
};

exports.photoController = (req, res, next) => {
  if (req.product.photo.data) {
    res.set("Content-Type", req.product.photo.contentType);
    return res.send(req.product.photo.data);
  }
  next();
};

exports.searchByNameController = (req, res) => {
  // create query object to hold search value and category value
  const query = {};
  // assign search value to query.name
  if (req.query.search) {
    query.name = { $regex: req.query.search, $options: "i" };
    // assigne category value to query.category
    if (req.query.category && req.query.category != "All") {
      query.category = req.query.category;
    }
    // find the product based on query object with 2 properties
    // search and category
    productModel
      .find(query, (err, products) => {
        if (err) {
          console.log("Searched product not found.");
          return res.status(400).json({
            error: errorHandler(err),
          });
        }
        console.log("Searched product found.");
        return res.status(200).json(products);
      })
      .select("-photo");
  }
};

exports.decreaseQuantityController = (req, res, next) => {
  let bulkOps = req.body.order.products.map((item) => {
    return {
      updateOne: {
        filter: { _id: item._id },
        update: { $inc: { quantity: -item.count, sold: +item.count } },
      },
    };
  });

  productModel.bulkWrite(bulkOps, {}, (error, products) => {
    if (error) {
      return res.status(400).json({
        error: "Could not update product",
      });
    }
    next();
  });
};
