const puppeteer = require("puppeteer");
const axios = require("axios");

async function scrapeCoopPages(url) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);

  const allProducts = await page.$$eval("div.productTile-details", (products) =>
    products.map((product) => {
      const storeName = "Coop";

      const titleRegEx =
        /naturaplan\s|prix\s|garantie\s|betty\s|bossi\s|\sca.*/gi;
      const title =
        product
          .getElementsByClassName("productTile-details__name-value")[0]
          .textContent.replace(titleRegEx, "") ?? "Not on page";

      const qtyAmount = parseFloat(
        product
          .getElementsByClassName("productTile__quantity-text")[0]
          .textContent.match(/\d+/g)
          .join()
      );

      const qtyStr = product.getElementsByClassName(
        "productTile__quantity-text"
      )[0].textContent;

      const price = parseFloat(
        product
          .getElementsByClassName("productTile__price-value-lead-price")[0]
          .textContent.trim()
          .replace(/\s+/g, " ")
      );

      // < -- depend on above variables ... conditional
      const incrPrice = parseFloat(
        product
          .getElementsByClassName("productTile__price-value")[0]
          .textContent?.trim()
          .replace(/\s+/g, " ")
          .split("/")[0] ?? price * qtyAmount
      );

      const incrQty = parseFloat(
        product
          .getElementsByClassName("productTile__price-value")[0]
          .textContent.trim()
          .replace(/\s+/g, " ")
          .split("/")[1]
          ?.match(/\d+/g)
          .join() ?? qtyAmount
      );

      const incrStr =
        // check if string contains a letter, if it does than return that string, else return qtyStr
        product
          .getElementsByClassName("productTile__price-value")[0]
          .textContent?.trim()
          .replace(/\s+/g, " ")
          .replace(/\d|\W/g, "").length !== 0
          ? product
              .getElementsByClassName("productTile__price-value")[0]
              .textContent?.trim()
              .replace(/\s+/g, " ")
          : qtyStr;

      // const categories = page.url().split("/")[5];

      const increment = {
        incrPrice: incrPrice,
        incrQty: incrQty,
        incrStr: incrStr,
      };

      const quantity = { qtyAmount: qtyAmount, qtyStr: qtyStr };
      const productData = {
        storeName: storeName,
        title: title,
        price: price,
        //   categories: categories,
        //   incrPrice: incrPrice,
        //   incrQty: incrQty,
        //   incrStr: incrStr,
        //   qtyAmount: qtyAmount,
        //   qtyStr: qtyStr,
        increment: increment,
        quantity: quantity,
      };

      return productData;
    })
  );

  //   allProducts.forEach(async (product) => {
  //     try {
  //       await axios.put("http://localhost:8000/product", product);
  //     } catch (err) {
  //       console.error(err);
  //     }
  //   });
  console.log(allProducts);
  console.log("Finished");
  await browser.close();
}

scrapeCoopPages(
  "https://www.coop.ch/de/lebensmittel/fruechte-gemuese/c/m_0001?q=%3Arelevance&sort=relevance&pageSize=60"
);

module.exports = scrapeCoopPages;

// find a way to check if product is in db but no longer on the website. If product is no longer carried at the store, remove it from the db.
