const mongoose = require("mongoose");

const schema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      minlength: 8,
    },
    phone: {
      type: String,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    verification_code: {
      type: Number,
    },
    googleId: { type: String },
    change_pass: {
      type: Date,
      default: Date.now,
    },
    myAppToken: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User_model", schema);
