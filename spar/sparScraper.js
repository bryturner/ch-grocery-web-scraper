const puppeteer = require("puppeteer");
const axios = require("axios");
const helpers = require("../helpers");

const groceryCategoryNames = [];

async function sparScraper(url) {
  const browser = await puppeteer.launch({
    headless: false,
  });

  const page = await browser.pages().then((e) => e[0]);

  await page.setViewport({
    width: 1000,
    height: 800,
    isMobile: false,
  });
  try {
    await page.goto(url, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(6000);
    console.log("waitedtimeout");

    //  #uc-center-container > div.sc-bYoBSM.egarKh > div > div.sc-dlVxhl.bEDIID > div > button:nth-child(2)

    for (let i = 0; i < 8; i++) {
      await page.keyboard.press("Tab");
    }

    await page.keyboard.press("Enter");

    const productsOnPage = await page.$$eval(
      "article.m-teaser-offer",
      (products) =>
        products.map((product) => {
          const titleRegReplace = /spar\s|original\s|frifag\s/gi;
          const qtyStringRegReplace = /\w.*(?=\,),\s|schale\sà\s/gi;

          const storeName = "Spar";

          // Might change because the id is part of the src in an image
          const productId =
            product
              .querySelector("img")
              .getAttribute("src")
              .match(/(?<=_)\w+(?=\.png)/g)
              .join("") || -1;

          const title =
            product
              .querySelector("h3")
              .textContent.replace(titleRegReplace, "") || undefined;

          const price =
            parseFloat(
              product.getElementsByClassName("m-price-box__price")[0]
                .textContent
            ) || -1;

          const quantityString = (
            product.querySelectorAll(".m-teaser-offer__text")[1]?.textContent ||
            product.querySelectorAll(".m-teaser-offer__text")[0]?.textContent ||
            price.toString()
          ).replace(qtyStringRegReplace, "");

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

    console.log(productsOnPage);
    //  if a product doesn't have a price, title, or id it is not stored in the db
    //  const allProducts = productsOnPage.filter((product) => {
    //    return product.price > 0 || product.id > 0 || product.title === String;
    //  });

    //  const groceryCategory = page
    //    .url()
    //    .match(/(?<=sortiment\/)\w.*(?=\/)/g)
    //    .join("")
    //    .replace("sortiment/", "");

    //  const finalProducts = allProducts.map((product) => {
    //    const { qtyStr, price } = product;

    //    // use helper functions to format and create object vals
    //    const increment = helpers.getProductIncrement(
    //      price.toFixed(2),
    //      quantityString
    //    );
    //    const formattedQtyStr = helpers.formatQtyString(qtyStr);
    //    const formattedCategory = helpers.formatCategory(groceryCategory);

    //    // format vals
    //    const incrementQuantity = parseFloat(
    //      increment.split("/")[1].match(/\d+/g).join()
    //    );
    //    const incrementPrice = parseFloat(increment.split("/")[0]);
    //    const quantityAmount = parseFloat(formattedQtyStr.split("/")[0]) || price;

    //    product["qtyStr"] = formattedQtyStr;
    //    product["qtyAmount"] = quantityAmount;
    //    product["categories"] = [formattedCategory];
    //    product["incrStr"] = increment;
    //    product["incrQty"] = incrementQuantity;
    //    product["incrPrice"] = incrementPrice;
    //    return product;
    //  });

    //  console.log(finalProducts);

    console.log("Success");
  } catch (err) {
    console.error(err);
  }

  //   await browser.close();
}

sparScraper("https://www.spar.ch/aktuelles/angebote");

module.exports = sparScraper;
