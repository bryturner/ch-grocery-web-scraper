const puppeteer = require("puppeteer");
const axios = require("axios");
const helpers = require("../helpers");

const groceryCategoryNames = [];

async function dennerScraper(url) {
  const browser = await puppeteer.launch({
    headless: true,
  });
  const page = await browser.pages().then((e) => e[0]);

  try {
    await page.goto(url);

    await page.waitForSelector("div.carosel-item");

    const productsOnPage = await page.$$eval("div.carosel-item", (products) =>
      products.map((product) => {
        const titleRegReplace = /mmmh\s|ip-suisse\s|/gi;
        const qtyStringRegMatch = /per.*|\d.*/gi;
        const qtyStringRegReplace = /\w.*(?=,\s)|,\s/g;

        const storeName = "Denner";

        const productId =
          product.getAttribute("id")?.match(/\d/g).join("") || -1;

        const title =
          product
            .querySelector("h3")
            .textContent.replace(titleRegReplace, "") || undefined;

        const price =
          parseFloat(
            product.getElementsByClassName("aktuell")[0].textContent
          ) || -1;

        const quantityString =
          product
            .getElementsByClassName("beschreibung")[0]
            .textContent?.match(qtyStringRegMatch)
            ?.join("")
            .replace(qtyStringRegReplace, "") || price.toString();

        const productData = {
          productId: productId,
          storeName: storeName,
          title: title,
          price: price,
          qtyStr: quantityString,
        };

        return productData;
      })
    );

    //  if a product doesn't have a price, title, or id it is not stored in the db
    const allProducts = productsOnPage.filter((product) => {
      return product.price > 0 || product.id > 0 || product.title === String;
    });

    const groceryCategory = page
      .url()
      .match(/(?<=sortiment\/)\w.*(?=\/)/g)
      .join("")
      .replace("sortiment/", "");

    const allFormattedProducts = allProducts.map((product) => {
      const { qtyStr, price, title } = product;

      // ===== format product values =====
      // RegEx
      const titleRegReplace = /mmmh\s|ip-suisse\s|/gi;

      // use helper functions to format and create object vals
      const formattedIncrementString = helpers.getProductIncrement(
        price.toFixed(2),
        qtyStr
      );
      const formattedQtyStr = helpers.formatQtyString(qtyStr);
      const formattedCategory = helpers.formatCategory(groceryCategory);

      // format values
      const formattedTitle = title.replace(titleRegReplace, "");

      // update product values before db insertion
      product["title"] = formattedTitle;
      product["categories"] = [formattedCategory];
      product["qtyStr"] = formattedQtyStr;
      product["incrStr"] = formattedIncrementString;

      return product;
    });

    console.log(allFormattedProducts);

    console.log("Success");
  } catch (err) {
    console.error(err);
  }

  //   await browser.close();
}

dennerScraper(
  "https://www.denner.ch/de/sortiment/sortiment/fruechte-und-gemuese/"
);

module.exports = dennerScraper;
