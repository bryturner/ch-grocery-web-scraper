const mongoose = require("mongoose");

const coopProductSchema = new mongoose.Schema(
  {
    storeName: { type: String },
    title: { type: String },
    brand: { type: String },
    billingIncrement: { type: String },
    quantity: { type: String },
    price: { type: String },
    //  sale: { type: String, default: false },
  },
  { timestamps: true }
);

const coopProduct = mongoose.model("coopProduct", coopProductSchema);

module.exports = coopProduct;

// {
// 	storeName: "Coop",
// 	title: "Apfel",
// 	brand: "Coop",
// 	billingIncrement: "1.22/100g",
// 	quantity: "500g",
// 	price: "4.50"
//  }
