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

async function scrapeCoopPages(categories) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.pages().then((e) => e[0]);

  try {
    for (let category of categories) {
      await page.goto(
        `https://www.coop.ch/de/lebensmittel/${category}?page=1&pageSize=60&q=%3Arelevance&sort=relevance`
      );

      await page.waitForSelector(
        "body > main > div:nth-child(3) > div.constrained--sm-up > div.productListPageNav.spacing-bottom-10 > div > a:nth-child(5)"
      );

      const numberOfPages = await page.$eval(
        "body > main > div:nth-child(3) > div.constrained--sm-up > div.productListPageNav.spacing-bottom-10 > div > a:nth-child(5)",
        (pageNum) => parseInt(pageNum.textContent.trim())
      );

      const allCategoryPages = [];

      for (let i = 1; i < numberOfPages + 1; i++) {
        await page.goto(
          `https://www.coop.ch/de/lebensmittel/${category}?page=${i}&pageSize=60&q=%3Arelevance&sort=relevance`
        );

        await page.waitForSelector("li.list-page__item");

        const productsOnPage = await page.$$eval(
          "li.list-page__item",
          (products) =>
            products.map((product) => {
              const storeName = "Coop";

              const productId =
                product
                  .querySelector("a")
                  ?.getAttribute("id")
                  ?.concat("coop") || -1;

              const title =
                product.getElementsByClassName(
                  "productTile-details__name-value"
                )[0]?.textContent || -1;

              const price = parseFloat(
                product
                  .getElementsByClassName(
                    "productTile__price-value-lead-price"
                  )[0]
                  ?.textContent.trim()
                  .replace(/\s+/g, " ") || -1
              );

              const quantityString =
                product.getElementsByClassName("productTile__quantity-text")[0]
                  ?.textContent || `${price.toString()}/ST`;

              const incrementString =
                product
                  .getElementsByClassName(
                    "productTile__price-value-per-weight-text"
                  )[0]
                  ?.textContent?.trim() || `${price.toString()}/ST`;

              const productData = {
                productId: productId,
                storeName: storeName,
                title: title,
                price: price,
                incrStr: incrementString,
                qtyStr: quantityString,
              };

              return productData;
            })
        );

        allCategoryPages.push(productsOnPage);
      }

      //   if a product doesn't have a price, title, or id it is not stored in the db
      const allProducts = allCategoryPages.flat().filter((product) => {
        return product.price > 0 || product.id > 0 || product.title === String;
      });

      // get grocery category from page url
      const groceryCategory = page
        .url()
        .match(/(?<=lebensmittel\/)\w.+(?=\/c)/g)
        .join("");

      const allFormattedProducts = allProducts.map((product) => {
        const { title } = product;

        // ===== format product values =====
        // RegEx
        const titleRegReplace =
          /naturaplan\s|prix\s|garantie\s|betty\s|bossi\s|fairtrade\s|\sca.*|\s\d.*/gi;

        // format values
        const formattedTitle = title.replace(titleRegReplace, "");

        // update product values before db insertion
        product["title"] = formattedTitle;
        product["categories"] = [groceryCategory];

        return product;
      });

      const bulkResponse = await axios.put(
        "http://localhost:8000/product/bulk",
        allFormattedProducts
      );
      console.log(
        `Status:${bulkResponse.status}! ${groceryCategory} in the DB`
      );
    }
  } catch (err) {
    page.reload();
    console.error(err);
  }

  await browser.close();
}

// scrapeCoopPages(groceryCategoryNames);
scrapeCoopPages(["fruechte-gemuese/c/m_0001"]);

module.exports = scrapeCoopPages;

// `https://www.coop.ch/de/lebensmittel/${category}?page=${i}&pageSize=60&q=%3Arelevance&sort=relevance`
