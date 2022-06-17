const puppeteer = require("puppeteer");
const axios = require("axios");

async function scrapeCoopPages(url) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);

  const allProducts = await page.$$eval("div.productTile-details", (products) =>
    products.map((product) => {
      const storeName = "Coop";
      const title =
        product.getElementsByClassName("productTile-details__name-value")[0]
          .textContent ?? "Not on page";

      const brand = product.getElementsByClassName(
        "productTile__productMeta-value-item"
      )[0].textContent;

      const quantityAmount = parseFloat(
        product
          .getElementsByClassName("productTile__quantity-text")[0]
          .textContent.match(/\d+/g)
          .join()
      );

      const quantityString = product.getElementsByClassName(
        "productTile__quantity-text"
      )[0].textContent;

      const price = parseFloat(
        product
          .getElementsByClassName("productTile__price-value-lead-price")[0]
          .textContent.trim()
          .replace(/\s+/g, " ")
      );

      // < -- depend on above variables ... conditional
      const incrementPrice = parseFloat(
        product
          .getElementsByClassName("productTile__price-value")[0]
          .textContent?.trim()
          .replace(/\s+/g, " ")
          .split("/")[0] ?? price * quantityAmount
      );

      const incrementQuantity = parseFloat(
        product
          .getElementsByClassName("productTile__price-value")[0]
          .textContent.trim()
          .replace(/\s+/g, " ")
          .split("/")[1]
          ?.match(/\d+/g)
          .join() ?? quantityAmount
      );

      const incrementString =
        // check if string contains a letter, if it does than return that string, else return quantityString
        product
          .getElementsByClassName("productTile__price-value")[0]
          .textContent?.trim()
          .replace(/\s+/g, " ")
          .replace(/\d|\W/g, "").length !== 0
          ? product
              .getElementsByClassName("productTile__price-value")[0]
              .textContent?.trim()
              .replace(/\s+/g, " ")
          : quantityString;

      const productData = {
        storeName: storeName,
        title: title,
        brand: brand,
        incrementPrice: incrementPrice,
        incrementQuantity: incrementQuantity,
        incrementString: incrementString,
        quantityAmount: quantityAmount,
        quantityString: quantityString,
        price: price,
      };

      return productData;
    })
  );

  //   allProducts.forEach(async (product) => {
  //     await axios.put("http://localhost:8000/product", product);
  //   });

  await browser.close();
}

// scrapeCoopPages(
//   "https://www.coop.ch/de/lebensmittel/fruechte-gemuese/c/m_0001?page=2&q=%3Arelevance&sort=relevance"
// );

module.exports = scrapeCoopPages;

// find a way to check if product is in db but no longer on the website. If product is no longer carried at the store, remove it from the db.
