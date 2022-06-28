const puppeteer = require("puppeteer");
const axios = require("axios");

const groceryCategoryNames = [];

async function navigateMigrosPages(categories) {
  //   const browser = await puppeteer.launch({ headless: false });
  const browser = await puppeteer.launch();

  const page = await browser.newPage();

  for (let category of categories) {
    await page.goto(`https://www.migros.ch/de/category/${category}`);

    const zipCookie = { name: "mo-guestZip", value: "8001" };
    await page.setCookie(zipCookie);

    await page.waitForSelector("div.show-product-detail");

    const productsOnPage = await page.$$eval(
      "div.show-product-detail",
      (productDetails) =>
        productDetails.map((productDetail) => {
          const idReg = /(?<=image"\shref="\/de\/product\/)[^"]+(?=")/g;
          const priceReg = /(?<=price">)[^<]+(?=<)/g;
          const titleRegMatch = /(?<=>)[^\d<]+(?=<)/g;
          const titleRegReplace =
            /fresca\s|anna's\sbest\s|regionaler\s|preis\s|m-budget\s/gi;
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

    console.log(productsOnPage);
    //  const allProducts = productsOnPage.flat();
    // .filter((product) => product.price); // remove any products without a price (not available at store)

    //  const groceryCategory = page.url().split("/")[5];

    //  for (let product of allProducts) {
    //    product["categories"] = [groceryCategory];
    //  }

    //  for (let product of allProducts) {
    //    try {
    //      await axios.put("http://localhost:8000/product", product);
    //    } catch (err) {
    //      console.error(err);
    //    }
    //  }

    //   console.log(allProducts);
  }
  console.log("Success");
  await browser.close();
}

navigateMigrosPages(["obst-gemuse"]);

module.exports = navigateMigrosPages;

// "https://www.migros.ch/de/category/obst-gemuse"
