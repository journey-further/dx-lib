import html from "./insert.html";

export const STATE = {
  mensApiURL:
    "https://www.russellandbromley.co.uk/ccstore/v1/assembler/pages/Default/services/guidedsearch/ccstoreui/v1/search?N=2053886397&Ns=&No=0&Nr=AND%28product.active%3A1%2CNOT%28record.type%3AStore%29%29&Nrpp=4&Ntt=&Nf=",
  womensApiURL:
    "https://www.russellandbromley.co.uk/ccstore/v1/assembler/pages/Default/services/guidedsearch/ccstoreui/v1/search?N=2148360829&Ns=&No=0&Nr=AND%28product.active%3A1%2CNOT%28record.type%3AStore%29%29&Nrpp=4&Ntt=&Nf=",
};

export const reset = () => {
  document.querySelectorAll(".RAB_011160---trending-product-container").forEach((el) => el.remove());
  if (!/search/.test(window.location.href)) {
    STATE?.updated?.destroy();
    STATE?.ready?.destroy();
    STATE?.removed?.destroy();
  }
};

const getTrendingProductDataFromResponse = (response = {}) => {
  // if (!response) return;

  const products = response?.resultsList?.records || [];
  const productsData = [];

  if (products?.length) {
    products.map((product) => {
      if (product?.records?.length) {
        const productData = product?.records[0] || {};
        const productName = productData?.attributes["product.displayName"]
          ? productData.attributes["product.displayName"].join()
          : "";
        const productDesc = productData?.attributes["product.description"]
          ? productData.attributes["product.description"].join()
          : "";
        const productURL = productData?.attributes["product.route"]
          ? productData.attributes["product.route"].join()
          : "";
        const productPrice = productData?.attributes["sku.activePrice"]
          ? parseFloat(productData.attributes["sku.activePrice"].join()).toFixed(2, 10)
          : "";
        const productImageURL = productData?.attributes["product.primaryLargeImageURL"]
          ? productData.attributes["product.primaryLargeImageURL"].join()
          : "";
        const productImageAlt = productData?.attributes["product.primaryImageAltText"]
          ? productData.attributes["product.primaryImageAltText"].join()
          : "";

        productsData.push({ productName, productDesc, productURL, productPrice, productImageURL, productImageAlt });
      }

      return product;
    });
  }

  console.log("mensResponse: ", response);
  console.log(response.resultsList.records[0].records[0]);

  return productsData;
};

const fetchProductsData = async (variant) => {
  console.log("feting product data");
  try {
    const mensApiURL = `https://www.russellandbromley.co.uk/ccstore/v1/assembler/pages/Default/services/guidedsearch/ccstoreui/v1/search?N=2053886397&Ns=&No=0&Nr=AND%28product.active%3A1%2CNOT%28record.type%3AStore%29%29&Nrpp=${variant == "A" ? "2" : "4"}&Ntt=&Nf=`;
    const womensApiURL = `https://www.russellandbromley.co.uk/ccstore/v1/assembler/pages/Default/services/guidedsearch/ccstoreui/v1/search?N=2148360829&Ns=&No=0&Nr=AND%28product.active%3A1%2CNOT%28record.type%3AStore%29%29&Nrpp=${variant == "A" ? "2" : "4"}&Ntt=&Nf=`;

    // fetch from sessionStorage
    const storedMens =
      (!!sessionStorage.getItem("RAB_011160_mens") && JSON.parse(sessionStorage.getItem("RAB_011160_mens"))) || null;
    const storedWomens =
      (!!sessionStorage.getItem("RAB_011160_womens") && JSON.parse(sessionStorage.getItem("RAB_011160_womens"))) ||
      null;

    if (storedMens && storedWomens) {
      console.log("already got in SS");
      STATE.trendingData = {
        mensData: storedMens,
        womensData: storedWomens,
      };
      return;
    }

    console.log("fetching new data");
    // otherwise, fetch from page and set to sessionStorage
    const mensResponse = await fetch(mensApiURL);
    const mensResponseData = await mensResponse.json();
    const mensData = getTrendingProductDataFromResponse(mensResponseData);
    sessionStorage.setItem("RAB_011160_mens", JSON.stringify(mensData));

    const womensResponse = await fetch(womensApiURL);
    const womensResponseData = await womensResponse.json();
    const womensData = getTrendingProductDataFromResponse(womensResponseData);
    sessionStorage.setItem("RAB_011160_womens", JSON.stringify(womensData));

    console.log(mensData);

    STATE.trendingData = {
      mensData,
      womensData,
    };
  } catch (e) {
    throw Error(e);
  }
};

const getProductHTML = (type = "") => {
  let productData = null;
  let productHtml = "";

  console.log("getting product HTML");

  switch (type) {
    case "women":
      productData = STATE.trendingData.womensData;
      break;
    case "men":
      productData = STATE.trendingData.mensData;
      break;
    default:
  }

  console.log(productData);

  if (productData?.length) {
    productData.map((product) => {
      productHtml += `
        <div class="RAB_011160---product swiper-slide">
          <div class="RAB_011160---product-image"><a href="${product.productURL}"><img src="${product.productImageURL}" alt="${product.productImageAlt}"/></a></div>
          <div class="RAB_011160---product-title"><h2>${product.productName}</h2></div>
          <div class="RAB_011160---product-desc"><span>${product.productDesc}</span></div>
          <div class="RAB_011160---product-price"><span>£${product.productPrice}</span></div>
        </div>
        `;

      return product;
    });
  }
  return productHtml;
};

const createSearchResultDom = () => {
  let template = html;

  const womensProductHTML = getProductHTML("women");
  const mensProductHTML = getProductHTML("men");

  template = template.replace("{{womensProductHTML}}", womensProductHTML);
  template = template.replace("{{mensProductHTML}}", mensProductHTML);

  return template;
};

export const runScript = async (variant) => {
  console.log("running script");
  // DO STUFF
  try {
    await fetchProductsData(variant);

    const trendingSearchHTML = createSearchResultDom();

    if (trendingSearchHTML) {
      document.querySelectorAll(".RAB_011160---trending-product-container").forEach((element) => element?.remove());
      if (!document.querySelector(".NoResultsText")) {
        return;
      }

      document
        .querySelector(
          ".DynamicProductListingContainer__Section--Desktop .DynamicProductList__Table, .DynamicProductListingContainer .DynamicProductList__Table"
        )
        .insertAdjacentHTML("beforebegin", trendingSearchHTML);
    }
  } catch (e) {
    throw Error(e);
  }
};
