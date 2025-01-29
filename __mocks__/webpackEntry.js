import { elementReady, emitEvent, useMutationObserver, useSPA } from "../dist";
import style from "./style.scss";

const jfExperiment = {
  ticketId: "ALL_011184",
  variant: "A",
};

const STATE = {
  observer: useMutationObserver(jfExperiment.ticketId),
  ready1: null,
  ready2: null,
  ready3: null,
  // observer2: useMutationObserver(`${jfExperiment.ticketId}-pdp`),
};

const isPDP = () => !!window.contexts?.includes("pdp");
const isPLP = () => !!window.contexts?.includes("plp");

const swapPlpImages = () => {
  if (!isPLP()) return;
  const productTiles = document.querySelectorAll(".b-product_tile-image_link");

  if (productTiles.length === 0) return;
  console.log({ productTiles });
  productTiles.forEach((tile) => {
    const mainImage = tile.querySelector(".b-product_tile-image.b-product_tile_alt_view-item");
    const secondImage = tile.querySelector(".b-product_tile_alt_view-item.m-alt.b-product_tile-image");

    if (!mainImage || !secondImage) {
      return;
    }

    if (
      secondImage.classList.contains("ALL_011184--new-first-img") ||
      mainImage.classList.contains("ALL_011184--new-first-img")
    ) {
      return;
    }
    try {
      const mainImageClass = mainImage.className;
      const secondImageClass = secondImage.className;

      mainImage.className = secondImageClass;
      secondImage.className = mainImageClass;

      secondImage.classList.add("ALL_011184--new-first-img");

      const mainImageParent = mainImage.parentNode;
      const secondImageParent = secondImage.parentNode;
      const mainImagePlaceholder = document.createElement("div");
      const secondImagePlaceholder = document.createElement("div");

      mainImageParent.replaceChild(mainImagePlaceholder, mainImage);
      secondImageParent.replaceChild(secondImagePlaceholder, secondImage);
      mainImageParent.replaceChild(secondImage, mainImagePlaceholder);
      secondImageParent.replaceChild(mainImage, secondImagePlaceholder);
    } catch (e) {
      emitEvent("error", jfExperiment, e);
    }
  });
};

const swapThumbnails = () => {
  if (!isPDP()) return;
  console.log("swapping thumbnails");

  const firstTarget = document.querySelector(
    ".b-product_gallery-thumbs_track > .b-product_gallery-thumb:nth-of-type(1) > picture"
  );
  const secondTarget = document.querySelector(
    ".b-product_gallery-thumbs_track > .b-product_gallery-thumb:nth-of-type(2) > picture"
  );

  swapFirstAndSecond(firstTarget, secondTarget);
};

const swapZoomModal = () => {
  if (!isPDP()) return;
  console.log("swapping zoom modal");

  const firstOrSecondActive = !!document.querySelector(
    `.b-product_gallery-thumbs_track > .b-product_gallery-thumb:nth-child(1)[class*="m-current"], .b-product_gallery-thumbs_track > .b-product_gallery-thumb:nth-child(2)[class*="m-current"]`
  );

  if (!firstOrSecondActive) return;

  const firstTarget = document.querySelector(".pswp__container > .pswp__item:nth-child(2)");
  const secondTarget = document.querySelector(".pswp__container > .pswp__item:nth-child(3)");

  swapFirstAndSecond(firstTarget, secondTarget);
};

const swapFirstAndSecond = (firstTarget, secondTarget) => {
  if (!!!firstTarget || !!!secondTarget) {
    console.log("no first or second target");
    return;
  }

  const firstSources = firstTarget.querySelectorAll("source");
  const secondSources = secondTarget.querySelectorAll("source");

  const firstSourcesArray = [...firstSources].map((source) => source.getAttribute("srcset"));
  const secondSourcesArray = [...secondSources].map((source) => source.getAttribute("srcset"));

  firstSources.forEach((source, i) => {
    if (!source.classList.contains("swapped")) {
      source.setAttribute("srcset", secondSourcesArray[i]);
      source.classList.add("swapped");
    }
  });
  secondSources.forEach((source, i) => {
    if (!source.classList.contains("swapped")) {
      source.setAttribute("srcset", firstSourcesArray[i]);
      source.classList.add("swapped");
    }
  });

  const firstImages = firstTarget.querySelectorAll("img");
  const secondImages = secondTarget.querySelectorAll("img");

  const firstImagesArray = [...firstImages].map((img) => img.getAttribute("src"));
  const secondImagesArray = [...secondImages].map((img) => img.getAttribute("src"));

  firstImages.forEach((img, i) => {
    if (!img.classList.contains("swapped")) {
      img.setAttribute("src", secondImagesArray[i]);
      img.classList.add("swapped");
    }
  });
  secondImages.forEach((img, i) => {
    if (!img.classList.contains("swapped")) {
      img.setAttribute("src", firstImagesArray[i]);
      img.classList.add("swapped");
    }
  });
};

const swapCarouselImg = () => {
  if (!isPDP()) return;

  const firstTarget = document.querySelector(
    ".b-product_slider-track > .b-product_slider-item:nth-of-type(1) > picture.b-product_image"
  );
  const secondTarget = document.querySelector(
    ".b-product_slider-track > .b-product_slider-item:nth-of-type(2) > picture.b-product_image"
  );

  swapFirstAndSecond(firstTarget, secondTarget);
};

const watchForChanges = () => {
  if (!isPLP()) return;
  // console.log(STATE.observer.details.isObserving, "observing");
  if (!!STATE.observer.details.isObserving) return;
  console.log("watching for changes PLP");
  /** @type {Element} The Target element to listen for changes to */
  const target = document.querySelector("body");
  if (!!!target) {
    console.log("no watch target PLP");
    return;
  }

  /** @type {MutationObserverInit} The MutationObserver options */
  const config = { childList: true, subtree: true, attributes: true };

  /** @type {MutationCallback} The Callback */
  const callback = (mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === 1) {
          console.log(node.nodeType);
          swapPlpImages();
        }
      });
    });
  };

  /** Trigger the observer */
  STATE.observer.observe(target, config, callback);
};

const applyChanges = async () => {
  try {
    // await reset();
    swapPlpImages();
    watchForChanges();
    STATE.ready1 = elementReady(".b-product_image", swapCarouselImg, "ALL_011184--carousel_img");
    STATE.ready2 = elementReady(".b-product_gallery-thumb picture", swapThumbnails, "ALL_011184--thumb_img");
    STATE.ready3 = elementReady(".pswp__container img", swapZoomModal, "ALL_011184--zoom_img");
  } catch (e) {
    emitEvent("error", jfExperiment, e);
  }
};

const reset = async () => {
  try {
    await STATE.ready1?.destroy(0);
    await STATE.ready2?.destroy(0);
    await STATE.ready3?.destroy(0);
  } catch (e) {
    emitEvent("error", jfExperiment, e);
  }
};

(() => {
  try {
    const Test = useSPA(jfExperiment.ticketId);
    Test.init({
      apply: applyChanges,
      reset,
      location: /\/men(\/ramskull|)\/(shirts|knitwear)/gi,
      alwaysReset: true,
    });
  } catch (e) {
    emitEvent("error", jfExperiment, e);
  }
})();
