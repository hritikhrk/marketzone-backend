const crypto = require("crypto");
const { v1: uuidv1 } = require("uuid");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
      maxLength: 32,
    },
    email: {
      type: String,
      trim: true,
      required: true,
      unique: true,
    },
    hashed_password: {
      type: String,
      required: true,
    },
    about: {
      type: String,
      trim: true,
    },
    role: {
      type: Number,
      default: 1,
    },
    history: {
      type: Array,
      default: [],
    },
    otherDetails: {
      isAdmin: {
        type: Boolean,
        default: false,
      },
      isMember: {
        type: Boolean,
        default: false,
      },
      emailVerified: {
        type: Boolean,
        default: false,
      },
      emailVerifiedAt: {
        type: Date,
      },
      blocked: {
        type: Boolean,
        default: false,
      },
    },
    salt: String,
    resetPasswordLink: {
      data: String,
      default: "",
    },
  },
  { timestamps: true }
);

//virtual field
userSchema
  .virtual("password")
  .set(function (password) {
    this._password = password;
    this.salt = uuidv1();
    console.log("salt: " + this.salt);
    this.hashed_password = this.encryptPassword(password);
  })
  .get(() => this._password);

userSchema.methods = {
  authenticate: function (plainText) {
    return this.encryptPassword(plainText) === this.hashed_password;
  },

  encryptPassword: function (password) {
    if (!password) return "";
    try {
      return crypto
        .createHmac("sha1", this.salt)
        .update(password)
        .digest("hex");
    } catch (err) {
      return "Something went wrong";
    }
  },
};

const users = mongoose.model("users", userSchema);
module.exports = users;
