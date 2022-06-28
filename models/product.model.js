const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    productId: String,
    storeName: String,
    title: String,
    price: Number,
    categories: Array,
    increment: Object,
    quantity: Object,
    //  Could use in the future if there are lots of users in order to more quickly reference products on a user's favorites or grocery list
    //  favorites: { type: Array, required: true },
    //  grocList: { type: Array, required: true },
  },
  { timestamps: true }
);

const Product = mongoose.model("product", productSchema);

module.exports = Product;

// add display price as string/ keep price as number for math
// {
// "productId" : "1234567"
// 	"storeName": "Coop",
// 	"title": "Bananas",
// 	"price": 2.50,
// 	"categories": ["Fruit"],
// 	"increment": {
// 	  "incrPrice": 2.50,
// 	  "incrQty": 2.50,
// 	  "incrStr": "2.50/1kg",
// 	},
// 	"quantity": {
// 	  "qtyAmount": 1,
// 	  "qtyStr": "1kg",
// 	},
// 	"favorites": [],
// 	"grocList": [],
//  },
