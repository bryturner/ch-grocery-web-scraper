const router = require("express").Router();
const Product = require("../models/product.model");

router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    console.error(err);
  }
});

// const queryMostRecent = req.query.mostRecent;
// 	const queryCategory = req.query.category;
// 	try {
// 		let products;

// 		if (queryMostRecent) {
// 			products = await Product.find().sort({ createdAt: -1 }).limit(1);
// 		} else if (queryCategory) {
// 			products = await Product.find({
// 				categories: {
// 					$in: [queryCategory],
// 				},
// 			});
// 		} else {
// 			products = await Product.find();
// 		}

router.post("/", async (req, res) => {
  try {
    const {
      productId,
      storeName,
      title,
      price,
      categories,
      incrPrice,
      incrQty,
      incrStr,
      qtyAmount,
      qtyStr,
    } = req.body;

    const increment = {
      incrPrice: incrPrice,
      incrQty: incrQty,
      incrStr: incrStr,
    };

    const quantity = { qtyAmount: qtyAmount, qtyStr: qtyStr };

    const newProduct = new Product({
      productId: productId,
      storeName: storeName,
      title: title,
      price: price,
      categories: categories,
      increment: increment,
      quantity: quantity,
    });

    const savedProduct = await newProduct.save();
    res.json(savedProduct);
  } catch (err) {
    console.error(err);
  }
});

router.put("/", async (req, res) => {
  try {
    const { productId, storeName, title, price, categories, incrStr, qtyStr } =
      req.body;

    const product = {
      productId: productId,
      storeName: storeName,
      title: title,
      price: price,
      categories: categories,
      incrStr: incrStr,
      qtyStr: qtyStr,
    };

    await Product.findOneAndUpdate(
      { productId: req.body.productId },
      {
        $set: product,
      },
      { upsert: true }
    );
    res.send();
  } catch (err) {
    console.error(err);
  }
});

router.put("/bulk", async (req, res) => {
  try {
    const products = req.body;

    await Product.bulkWrite(
      products.map((product) => ({
        updateOne: {
          filter: { productId: product.productId },
          update: { $set: product },
          upsert: true,
        },
      }))
    );
    res.status(200).send();
  } catch (err) {
    console.error(err);
    res.status(500).send();
  }
});

module.exports = router;
