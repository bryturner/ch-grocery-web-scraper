const puppeteer = require("puppeteer");
const axios = require("axios");

const groceryCategoryNames = [];

async function migrosScraper(url) {
  const browser = await puppeteer.launch({ headless: false });
  //   const browser = await puppeteer.launch();

  try {
    const page = await browser.newPage();

    await page.goto(url);

    const zipCookie = { name: "mo-guestZip", value: "8001" };
    await page.setCookie(zipCookie);

    //   await page.waitForSelector("div.show-product-detail");

    await page.waitForSelector("div.btn-view-more");

    while (
      (await page.$(
        "#catalog-products-content > div.products-view-body > app-products-display > div:nth-child(3) > div > button"
      )) !== null
    ) {
      await page.click(
        "#catalog-products-content > div.products-view-body > app-products-display > div:nth-child(3) > div > button"
      );
      await page.waitForTimeout(5000);
    }

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
            /fresca\s|anna's\sbest\s|regionaler\s|preis\s|m-budget\s|sylvain\s&\sco\s|extra\s|frifrench\s|back\sto\sthe\sroots|demeter\s/gi;
          const qtyStringReg = /(?<=weight"><!---->)[^<]+(?=<)/g;
          const qtyAmountReg = /(?<=>)[^\D]+(?=\D)/g;

          const storeName = "Migros";

          const productId =
            productDetail.innerHTML.match(idReg).join("").trim() || -1;

          const title =
            productDetail.innerHTML
              .match(titleRegMatch)
              .join(" ")
              .trim()
              .replace(titleRegReplace, "") || -1;

          const price =
            parseFloat(
              productDetail.innerHTML.match(priceReg).join("").trim()
            ) || -1;

          const quantityString =
            productDetail.innerHTML.match(qtyStringReg).join("").trim() ||
            price.toString();

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
      for (let value of Object.values(product)) {
        if (value !== -1) return true;
      }
    });

    let groceryCategory = page.url().split("/")[5];

    groceryCategory = groceryCategory.replace("obst", "fruechte");

    for (let product of allProducts) {
      product["categories"] = [groceryCategory];
    }

    console.log(allProducts);

    console.log("Success");
  } catch (err) {
    console.error(err);
  }

  //   const page = await browser.newPage();

  //   await page.goto(url);

  //   const zipCookie = { name: "mo-guestZip", value: "8001" };
  //   await page.setCookie(zipCookie);

  //   //   await page.waitForSelector("div.show-product-detail");

  //   await page.waitForSelector("div.btn-view-more");

  //   while (
  //     (await page.$(
  //       "#catalog-products-content > div.products-view-body > app-products-display > div:nth-child(3) > div > button"
  //     )) !== null
  //   ) {
  //     await page.click(
  //       "#catalog-products-content > div.products-view-body > app-products-display > div:nth-child(3) > div > button"
  //     );
  //     await page.waitForTimeout(5000);
  //   }

  //   const productsOnPage = await page.$$eval(
  //     "div.show-product-detail",
  //     (productDetails) =>
  //       productDetails.map((productDetail) => {
  //         // get product id from href as the product id used is unlikely to change in the future
  //         const idReg = /(?<=image"\shref="\/de\/product\/)[^"]+(?=")/g;
  //         const priceReg = /(?<=price">)[^<]+(?=<)/g;
  //         //   used to match words within arrow brackets
  //         const titleRegMatch = /(?<=>)[^\d<]+(?=<)/g;
  //         const titleRegReplace =
  //           /fresca\s|anna's\sbest\s|regionaler\s|preis\s|m-budget\s|sylvain\s&\sco\s|extra\s|frifrench\s|back\sto\sthe\sroots|demeter\s/gi;
  //         const qtyStringReg = /(?<=weight"><!---->)[^<]+(?=<)/g;
  //         const qtyAmountReg = /(?<=>)[^\D]+(?=\D)/g;

  //         const storeName = "Migros";

  //         const productId =
  //           productDetail.innerHTML.match(idReg).join("").trim() || -1;

  //         const title =
  //           productDetail.innerHTML
  //             .match(titleRegMatch)
  //             .join(" ")
  //             .trim()
  //             .replace(titleRegReplace, "") || -1;

  //         const price =
  //           parseFloat(productDetail.innerHTML.match(priceReg).join("").trim()) ||
  //           -1;

  //         const quantityString =
  //           productDetail.innerHTML.match(qtyStringReg).join("").trim() ||
  //           price.toString();

  //         const quantityAmount =
  //           parseFloat(productDetail.innerHTML.match(qtyAmountReg)) || price;

  //         const productData = {
  //           productId: productId,
  //           storeName: storeName,
  //           title: title,
  //           price: price,
  //           quantityString: quantityString,
  //           quantityAmount: quantityAmount,
  //         };

  //         return productData;
  //       })
  //   );

  //   //   if a product doesn't have a price, title, or id it is not stored in the db
  //   const allProducts = productsOnPage.filter((product) => {
  //     for (let value of Object.values(product)) {
  //       if (value !== -1) return true;
  //     }
  //   });

  //   let groceryCategory = page.url().split("/")[5];

  //   groceryCategory = groceryCategory.replace("obst", "fruechte");

  //   for (let product of allProducts) {
  //     product["categories"] = [groceryCategory];
  //   }

  //   console.log(allProducts);

  //   console.log("Success");
  //   await browser.close();
}

migrosScraper("https://www.migros.ch/de/category/obst-gemuse");

module.exports = migrosScraper;

// "https://www.migros.ch/de/category/obst-gemuse"
