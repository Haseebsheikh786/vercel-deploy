const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    userName: {
      type: String,
      required: [true],
    },
    email: {
      type: String,
      required: [true, "please add the user email address"],
      unique: [true, "Email address already taken"],
    },
    password: {
      type: String,
      required: [true, "please add the user password"],
    },
    role: { type: String, enum: ["admin", "user"], default: "user" },
    addresses: { type: [Schema.Types.Mixed] },
    Isverified: { type: Boolean, default: false },
    verificationCode: String,
    verificationTimestamp: { type: Date, required: true },
    ResetPasswordCode: String,
    ResetPasswordTimestamp: { type: Date },
  },
  {
    timestamps: true,
  }
);

exports.User = mongoose.model("User", userSchema);
