import Swiper from "swiper";
import { Pagination } from "swiper/modules";
import { createElement, elementReady, emitEvent, useSPA, waitFor } from "../dist";
import style from "./style.scss";

const jfExperiment = {
  ticketId: "TOS_008738",
  variant: "A",
};

const STATE = {};

const toggleModal = (open = true) => {
  console.log("toggling modal:", open);
  const target = document.querySelector(".TOS_008738--gallery");
  if (!!!target) {
    console.log("no toggle target");
    return;
  }
  target.classList[!!open ? "add" : "remove"]("open");
  if (!!open) bindCloseModal();
};

const handleBodyClick = (event) => {
  const { target } = event;
  if (!!target.closest(".modal-default") && !target.closest(".close-modal")) {
    console.log("clicked on modal");
    return;
  }
  console.log("clicked on body");
  document.body.removeEventListener("click", handleBodyClick);
  toggleModal(false);
};

const bindCloseModal = () => {
  setTimeout(() => {
    console.log("binding body click");
    document.body.removeEventListener("click", handleBodyClick);
    document.body.addEventListener("click", handleBodyClick);
  }, 200);
};

const initSwiper = () => {
  const target = document.querySelector(".TOS_008738--gallery .swiper");
  if (!!!target) {
    console.log("no swiper target");
    return;
  }
  const swiper = new Swiper(target, {
    slidesPerView: 1,
    modules: [Pagination],
    centeredSlides: true,
    centeredSlidesBounds: true,
  });
  console.log(swiper);
};

const createGallery = async () => {
  try {
    console.log("creating gallery");

    const outerWrapper = createElement("div", {
      class: "TOS_008738--gallery fixed inset-0 z-30 w-full h-screen flex items-start justify-center py-4 px-2 md:p-8",
    });
    // insert background shade
    outerWrapper.insertAdjacentHTML(
      "beforeend",
      `<div class="fixed inset-0 w-full h-screen bg-black-shade z-header"></div>`
    );

    const innerWrapper = createElement("div", { class: "relative modal-default" });
    innerWrapper.insertAdjacentHTML(
      "beforeend",
      `<div data-testid="modal-default-header" class="modal-default-header modal-default-header--background"><h2 data-testid="modal-title" class="w-10/12 w-full">Gallery</h2></div>
      <div data-testid="close-modal-button-container" class="close-modal z-20 flex items-center content-center justify-between gap-7 text-blue absolute top-2 right-4 mx-0 my-0"> <button data-testid="close-modal-button"><svg data-v-c9eb2644="" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" class=" xl"><path data-v-c9eb2644="" fill="currentColor" d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"></path></svg></button></div>`
    );

    const innerContent = createElement("div", { class: "modal-content overflow-y-auto" });

    // wrapper.insertAdjacentHTML("beforeend", `<div class="TOS_008738--close"><span class="sr-only">Close</span></div>`);

    const swiperOuter = createElement("div", { class: "swiper" });
    const swiperWrapper = createElement("div", { class: "swiper-wrapper" });

    await waitFor(() => {
      return (
        document.querySelectorAll(
          ".bg-white > .content-container > div:last-of-type > div:first-of-type > div:first-of-type > div > div:first-of-type .ssr-carousel .ssr-carousel-slide"
        ).length > 0
      );
    });

    const slides = [
      ...document.querySelectorAll(
        ".bg-white > .content-container > div:last-of-type > div:first-of-type > div:first-of-type > div > div:first-of-type .ssr-carousel .ssr-carousel-slide"
      ),
    ].map((slide) => {
      return `<div class="swiper-slide">
        ${slide.querySelector("picture")?.outerHTML || slide.querySelector("iframe")?.outerHTML}
      </div>`;
    });
    if (slides.length == 0) {
      console.log("issue with getting slides?");
      return;
    }

    swiperWrapper.insertAdjacentHTML("beforeend", slides.join(""));
    swiperOuter.insertAdjacentElement("beforeend", swiperWrapper);
    swiperOuter.insertAdjacentHTML("beforeend", `<div class="swiper-pagination"></div>`);
    innerContent.insertAdjacentElement("beforeend", swiperOuter);
    innerWrapper.insertAdjacentElement("beforeend", innerContent);
    outerWrapper.insertAdjacentElement("beforeend", innerWrapper);

    document.body.insertAdjacentElement("beforeend", outerWrapper);

    initSwiper();
  } catch (e) {
    emitEvent("error", jfExperiment, e);
  }
};

const handleOpenClick = (/** @type {MouseEvent} */ event) => {
  event.preventDefault();
  event.stopImmediatePropagation();
  const { target } = event;
  const shouldOpen = target.closest(".touch-pan-y.touch-pan-x")?.classList.contains("cursor-zoom-in");
  console.log("click gallery:", shouldOpen);

  if (!shouldOpen) {
    console.log("open click");
    toggleModal(true);
  } else {
    console.log("close click");
    toggleModal(false);
  }

  // const gallery = document.querySelector(".TOS_008738--gallery");
};

const bindOpenGallery = () => {
  console.log("binding gallery");

  STATE.pictureReady = elementReady(
    ".ssr-carousel-slide .touch-pan-y.touch-pan-x picture",
    (el) => {
      console.log("ready");
      el.removeEventListener("click", handleOpenClick);
      el.addEventListener("click", handleOpenClick);
    },
    "TOS_008738--picture"
  );
};

const resetChanges = () => {
  console.log("resetting");
  STATE.pictureReady?.destroy();
  document.querySelector(".TOS_008738--gallery")?.remove();
};

const applyChanges = () => {
  // DO STUFF
  console.log("applying changes");
  createGallery();
  bindOpenGallery();
};

(() => {
  try {
    const Test = useSPA(jfExperiment.ticketId);
    Test.init({
      apply: applyChanges,
      reset: resetChanges,
      style: style,
      location: /\/p\d+\/?(\?|$)/,
    });
  } catch (e) {
    emitEvent("error", jfExperiment, e);
  }
})();
