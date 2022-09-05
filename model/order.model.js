const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { ObjectId } = Schema;

const cartItemSchema = new Schema(
  {
    product: {
      type: ObjectId,
      ref: "products",
    },
    name: String,
    price: Number,
    count: Number,
  },
  { timestamps: true }
);

const cartItemModel = mongoose.model("cartItems", cartItemSchema);

const orderSchema = new Schema(
  {
    products: [cartItemSchema],
    transactionId: {},
    amount: Number,
    address: String,
    status: {
      type: String,
      default: "Not processed",
      enum: [
        "Not processed",
        "Processing",
        "Shipped",
        "Delivered",
        "Cancelled",
      ],
    },
    updatedAt: Date,
    user: {
      type: ObjectId,
      ref: "users",
    },
  },
  { timestamps: true }
);

const orderModel = mongoose.model("orders", orderSchema);

module.exports = { orderModel, cartItemModel };
