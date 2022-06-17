const router = require("express").Router();
const Product = require("../models/product.model");
const DummyProduct = require("../dummy/dummy.model");

router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    console.error(err);
  }
});

router.post("/", async (req, res) => {
  try {
    const {
      storeName,
      title,
      brand,
      incrementPrice,
      incrementQuantity,
      incrementString,
      quantityAmount,
      quantityString,
      price,
    } = req.body;

    const newProduct = new Product({
      storeName,
      title,
      brand,
      incrementPrice,
      incrementQuantity,
      incrementString,
      quantityAmount,
      quantityString,
      price,
    });

    const savedProduct = await newProduct.save();
    res.json(savedProduct);
  } catch (err) {
    console.error(err);
  }
});

router.put("/", async (req, res) => {
  try {
    await Product.findOneAndUpdate(
      { title: req.body.title },
      {
        $set: req.body,
      },
      { upsert: true }
    );
    res.send();
  } catch (err) {
    console.error(err);
  }
});

module.exports = router;
