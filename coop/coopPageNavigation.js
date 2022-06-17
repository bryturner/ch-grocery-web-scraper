const puppeteer = require("puppeteer");
const axios = require("axios");

const groceryCategoryNames = [
  "fruechte-gemuese/c/m_0001",
  "milchprodukte-eier/c/m_0055",
  "fleisch-fisch/c/m_0087",
  "brot-backwaren/c/m_0115",
  "getraenke/c/m_2242",
  "vorraete/c/m_0140",
  "suesses-snacks/c/m_2506",
  "tiefgekuehlte-produkte/c/m_0202",
  "fertiggerichte/c/m_9744",
];

async function navigateCoopPages(categories) {
  const browser = await puppeteer.launch();

  const page = await browser.newPage();

  for (let category of categories) {
    await page.goto(
      `https://www.coop.ch/de/lebensmittel/${category}?page=1&pageSize=60&q=%3Arelevance&sort=relevance`
    );

    const totalPages = await page.$eval(
      "body > main > div:nth-child(3) > div.constrained--sm-up > div.productListPageNav.spacing-bottom-10 > div > a:nth-child(5)",
      (pageNum) => parseInt(pageNum.textContent.trim())
    );

    console.log(totalPages);

    const allProductPages = [];

    for (let i = 1; i < totalPages + 1; i++) {
      await page.goto(
        `https://www.coop.ch/de/lebensmittel/${category}?page=${i}&pageSize=60&q=%3Arelevance&sort=relevance`
      );

      const productsOnPage = await page.$$eval(
        "div.productTile-details",
        (products) =>
          products.map((product) => {
            const storeName = "Coop";
            const title =
              product.getElementsByClassName(
                "productTile-details__name-value"
              )[0].textContent ?? "Not on page";

            const brand =
              product.getElementsByClassName(
                "productTile__productMeta-value-item"
              )[0].textContent || "Not specified";

            const quantityAmount = parseFloat(
              //   if no quantity amount, default to 1
              product
                .getElementsByClassName("productTile__quantity-text")[0]
                .textContent.match(/\d+/g)
                ?.join() ?? 1
            );

            const quantityString = product.getElementsByClassName(
              "productTile__quantity-text"
            )[0].textContent;

            const price = parseFloat(
              product
                .getElementsByClassName(
                  "productTile__price-value-lead-price"
                )[0]
                .textContent.trim()
                .replace(/\s+/g, " ")
            );

            // < -- depend on above variables ... conditional
            const incrementPrice = parseFloat(
              product
                .getElementsByClassName("productTile__price-value")[0]
                .textContent?.trim()
                .replace(/\s+/g, " ")
                ?.split("/")[0] ?? price * quantityAmount
            );

            const incrementQuantity = parseFloat(
              product
                .getElementsByClassName("productTile__price-value")[0]
                .textContent.trim()
                .replace(/\s+/g, " ")
                .split("/")[1]
                ?.match(/\d+/g)
                ?.join() ?? quantityAmount
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

            // const productCategory = page.url().split("/")[5];

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
              //   productCategory: productCategory,
            };

            return productData;
          })
      );

      allProductPages.push(productsOnPage);
    }

    const allProducts = allProductPages.flat();

    for (let product of allProducts) {
      try {
        await axios.put("http://localhost:8000/product", product);
      } catch (err) {
        console.error(err);
      }
    }
  }
  console.log("Success");
  await browser.close();
}

// navigateCoopPages(groceryCategoryNames);

module.exports = navigateCoopPages;

// `https://www.coop.ch/de/lebensmittel/${category}?page=${i}&pageSize=60&q=%3Arelevance&sort=relevance`
