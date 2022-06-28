function getProductIncrement(price, increment) {
  if (!price) return "n/a";
  if (!increment) return `${price.trim()}/1ST`;

  const priceNumber = parseFloat(price.trim());
  let incrementQuantity, numberOfProducts, incrementString;

  if (increment.includes("x")) {
    incrementQuantity = parseFloat(
      increment
        .match(/\.\d|\s\d+/g)
        .join("")
        .trim()
    );
    incrementString = increment
      .match(/[a-z]/gi)
      .join("")
      .replace("x", "")
      .trim();
    numberOfProducts = parseFloat(increment.split(" ")[0]);
  } else {
    incrementQuantity = parseFloat(increment.match(/\d|\W/g).join("").trim());
    incrementString =
      increment.match(/[a-z]/gi)?.join("") || `${price.trim()}/1ST`;
  }

  //   if(priceNumber === incrementQuantity) return `${price}/1ST`;

  // the increment quantity 1 or 100 can be used directly as an increment without any further division
  if (incrementQuantity === 100 || incrementQuantity === 1) {
    if (increment.includes("x")) {
      const perProductPrice =
        priceNumber / parseInt(increment.split(" ")[0]).toFixed(2);
      return `${perProductPrice.trim()}/${increment.split(" ")[2]}`;
    }
    return `${price.trim()}/${increment.trim()}`;
  }

  // if the increment is g, cl, ml -> increment qty is divided by 100
  if (
    incrementString === "g" ||
    incrementString === "cl" ||
    incrementString === "ml"
  ) {
    if (incrementQuantity < 100) {
      return `${price.trim()}/${increment.trim()}`;
    }

    let productPricePerUom = priceNumber / (incrementQuantity / 100);
    // if there is more than one of the same product in listing (ex. case of drinks) -> find price per product
    if (increment.includes("x")) {
      const pricePerProduct = priceNumber / numberOfProducts;
      productPricePerUom = pricePerProduct / (incrementQuantity / 100);
      return `${productPricePerUom.toFixed(2).trim()}/100${incrementString}`;
    }
    return `${productPricePerUom.toFixed(2).trim()}/100${incrementString}`;
  }

  // if the increment uom is kg or l -> price / increment qty
  if (incrementString === "kg" || incrementString === "l") {
    let productPricePerUom = priceNumber / incrementQuantity;
    // if there is more than one of the same product in listing (ex. case of drinks) -> find price per product
    if (increment.includes("x")) {
      const pricePerProduct = priceNumber / numberOfProducts;
      productPricePerUom = pricePerProduct / incrementQuantity;
      return `${productPricePerUom.toFixed(2).trim()}/100${incrementString}`;
    }
    return `${productPricePerUom.toFixed(2).trim()}/100${incrementString}`;
  }
  return `${price.trim()}/1ST`;
}

module.exports = getProductIncrement;
