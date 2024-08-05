const mongoose = require("mongoose");
const { Schema } = mongoose;

const productSchema = new Schema(
  {
    title: { type: String, required: true, unique: false},
    description: { type: String, required: true },
    price: {
      type: Number,
      required:true
    }, 
    discountPercentage: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 0,
    },
    stock: { type: Number, default: 0 },
    brand: { type: String, required: true },
    category: { type: String, required: false },
    thumbnail: { type: String, required: true },
    images: { type: [String], required: false, default: [] },
    discountPrice: { type: Number, default: 0 },
    deleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const virtual = productSchema.virtual("id");
virtual.get(function () {
  return this._id;
});
productSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
  },
});

exports.Product = mongoose.model("Product", productSchema);
