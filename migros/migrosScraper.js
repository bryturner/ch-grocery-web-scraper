const puppeteer = require("puppeteer");
const axios = require("axios");
const getProductIncrement = require("./migrosIncrementHelper.js");

const groceryCategoryNames = [];

async function migrosScraper(url) {
  const browser = await puppeteer.launch({
    headless: false,
  });

  //   const browser = await puppeteer.launch();
  const page = await browser.pages().then((e) => e[0]);

  await page.setViewport({
    width: 1000,
    height: 800,
    isMobile: false,
  });
  try {
    await page.goto(url);

    const zipCookie = { name: "mo-guestZip", value: "8001" };
    await page.setCookie(zipCookie);

    //   await page.waitForSelector("div.show-product-detail");

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
          const priceReg = /(?<=price">)[^<]+(?=<)/g;
          //   used to match words within arrow brackets
          const titleRegMatch = /(?<=>)[^\d<]+(?=<)/g;
          const titleRegReplace =
            /fresca\s|anna's\sbest\s|regionaler\s|preis\s|m-budget\s|sylvain\s&\sco\s|extra\s|frifrench\s|back\sto\sthe\sroots|demeter\s|statt\s|&nbsp;\s/gi;
          const qtyStringReg = /(?<=weight"><!---->)[^<]+(?=<)/g;
          const qtyStringRegReplace = /st\u00fcck\s/gi;
          const qtyAmountReg = /(?<=>)[^\D]+(?=\D)/g;

          const storeName = "Migros";

          const productId =
            productDetail.innerHTML.match(idReg).join("").trim() || -1;

          const title =
            productDetail.innerHTML
              .match(titleRegMatch)
              .join(" ")
              .replace(titleRegReplace, "")
              .trim() || undefined;

          const price =
            parseFloat(
              productDetail.innerHTML.match(priceReg).join("").trim()
            ) || -1;

          const quantityString =
            productDetail.innerHTML
              .match(qtyStringReg)
              .join("")
              .replace(qtyStringRegReplace, "ST")
              .replace(/\s+/g, "")
              .trim() || price.toString();

          const quantityAmount =
            parseFloat(productDetail.innerHTML.match(qtyAmountReg)) || price;

          const productData = {
            productId: productId,
            storeName: storeName,
            title: title,
            price: price,
            quantityString: quantityString,
            quantityAmount: quantityAmount,
          };

          return productData;
        })
    );

    //   if a product doesn't have a price, title, or id it is not stored in the db
    const allProducts = productsOnPage.filter((product) => {
      return product.price > 0 || product.id > 0 || product.title === String;
    });

    let groceryCategory = page.url().split("/")[5];

    groceryCategory = groceryCategory.replace("obst", "fruechte");

    for (let product of allProducts) {
      const increment = getProductIncrement(
        product.price.toFixed(2),
        product.quantityString
      );

      const incrementQuantity = parseFloat(
        increment.split("/")[1].match(/\d+/g).join()
      );
      const incrementPrice = parseFloat(increment.split("/")[0]);

      product["categories"] = [groceryCategory];
      product["incrStr"] = increment;
      product["incrQty"] = incrementQuantity;
      product["incrPrice"] = incrementPrice;
    }

    console.log(allProducts);

    console.log("Success");
  } catch (err) {
    console.error(err);
  }

  //   await browser.close();
}

migrosScraper("https://www.migros.ch/de/category/obst-gemuse");

module.exports = migrosScraper;

// "https://www.migros.ch/de/category/obst-gemuse"
