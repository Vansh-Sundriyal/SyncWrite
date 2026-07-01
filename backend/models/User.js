const mongoose = require("mongoose");

// A very simple user schema: name, unique email, and a hashed password
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true, // this will store the HASHED password, never the plain text
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
