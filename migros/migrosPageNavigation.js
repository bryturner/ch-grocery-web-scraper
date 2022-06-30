const puppeteer = require("puppeteer");
const axios = require("axios");
const helpers = require("../helpers");

const groceryCategoryNames = [
  "obst-gemuse",
  "fleisch-fisch",
  //   "milchprodukte-eier-frische-ferti/milch-butter-eier",
  //'milchprodukte-eier-frische-ferti',
  //   "brot-backwaren",
  //   "tiefkuhlprodukte",
  //   "getranke-kaffee-tee",
  //   "susse-lebensmittel",
  //   "wein-bier-spirituosen",
  //   "salzige-lebensmittel",
  //"salzige-lebensmittel/suppen-bouillons" vorraete
  //'salzige-lebensmittel/teigwaren-reis-gries-getreide', vorraete
  //   'salzige-lebensmittel/konserven-fertiggerichte', vorraete
  //   'salzige-lebensmittel/gewurze-saucen',
];

async function migrosPageNavigation(categories) {
  const browser = await puppeteer.launch({
    headless: true,
  });

  const page = await browser.pages().then((e) => e[0]);

  await page.setViewport({
    width: 1000,
    height: 800,
    isMobile: false,
  });

  await page.goto("https://www.migros.ch/de");
  const zipCookie = { name: "mo-guestZip", value: "8001" };
  await page.setCookie(zipCookie);

  try {
    for (let category of categories) {
      await page.goto(`https://www.migros.ch/de/category/${category}`);

      await page.waitForSelector("div.btn-view-more");

      //  while (
      //    (await page.$(
      //      "#catalog-products-content > div.products-view-body > app-products-display > div:nth-child(3) > div > button"
      //    )) !== null
      //  ) {
      //    await page.click(
      //      "#catalog-products-content > div.products-view-body > app-products-display > div:nth-child(3) > div > button"
      //    );
      //    await page.waitForTimeout(5000);
      //  }

      const productsOnPage = await page.$$eval(
        "div.show-product-detail",
        (productDetails) =>
          productDetails.map((productDetail) => {
            // get product id from href as the product id used is unlikely to change in the future
            const idReg = /(?<=image"\shref="\/de\/product\/)[^"]+(?=")/g;
            // !! Have to use innerHTML to find values -> problem with page rendering and headless browser
            const priceReg = /(?<=price">)[^<]+(?=<)/g;
            const titleRegMatch = /(?<=>)[^\d<]+(?=<)/g;
            const qtyStringReg = /(?<=weight"><!---->)[^<]+(?=<)/g;
            const qtyAmountReg = /(?<=>)[^\D]+(?=\D)/g;

            const storeName = "Migros";

            const productId =
              productDetail.innerHTML.match(idReg)?.join("").trim() || -1;

            const title =
              productDetail.innerHTML.match(titleRegMatch)?.join(" ") ||
              undefined;

            const price =
              parseFloat(
                productDetail.innerHTML.match(priceReg)?.join("").trim()
              ) || -1;

            const quantityString =
              productDetail.innerHTML.match(qtyStringReg)?.join("") ||
              price.toString();

            const quantityAmount =
              parseFloat(productDetail.innerHTML.match(qtyAmountReg)) || price;

            const productData = {
              productId: productId,
              storeName: storeName,
              title: title,
              price: price,
              qtyStr: quantityString,
              qtyAmount: quantityAmount,
            };

            return productData;
          })
      );

      //   if a product doesn't have a price, title, or id it is not stored in the db
      const allProducts = productsOnPage.filter((product) => {
        return product.price > 0 || product.id > 0 || product.title === String;
      });

      const groceryRegReplace = /salzige-lebensmittel\//g;
      const groceryCategory = page
        .url()
        .match(/(?<=category\/)\w.*/g)
        .join("")
        .replace(groceryRegReplace, "");

      const finalProducts = allProducts.map((product) => {
        const { price, qtyStr, title } = product;

        // use helper functions to format and create object vals
        const increment = helpers.getProductIncrement(price.toFixed(2), qtyStr);
        const formattedCategory = helpers.formatCategory(groceryCategory);

        // ===== format product values =====
        // RegEx
        const titleRegReplace =
          /fresca\s|anna's\sbest\s|regionaler\s|preis\s|m-budget\s|sylvain\s&\sco\s|extra\s|frifrench\s|back\sto\sthe\sroots|demeter\s|statt\s|&nbsp;\s/gi;
        const qtyStringRegReplace = /st\u00fcck\s/gi;

        // values
        const formattedTitle = title.replace(titleRegReplace, "").trim();
        const formattedQuantityString = qtyStr
          .replace(qtyStringRegReplace, "ST")
          .replace(/\s+/g, "")
          .trim();
        const incrementQuantity = parseFloat(
          increment.split("/")[1].match(/\d+/g).join()
        );
        const incrementPrice = parseFloat(increment.split("/")[0]);

        //   update product values before db insertion
        product["title"] = formattedTitle;
        product["categories"] = [formattedCategory];
        product["qtyStr"] = formattedQuantityString;
        product["incrStr"] = increment;
        product["incrQty"] = incrementQuantity;
        product["incrPrice"] = incrementPrice;

        return product;
      });

      console.log(finalProducts);

      console.log("Success");
    }
  } catch (err) {
    console.error(err);
  }

  await browser.close();
}

migrosPageNavigation(["obst-gemuse"]);

module.exports = migrosPageNavigation;

// "https://www.migros.ch/de/category/obst-gemuse"
