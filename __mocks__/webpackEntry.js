import Swiper from "swiper";
import { Navigation } from "swiper/modules";

import swiperStyles from "swiper/css";
import { emitEvent, waitForElement, elementReady, insertStyle, useMutationObserver } from "../dist";
import style from "./style.scss";

const jfExperiment = {
  ticketId: "GHD_010112",
  variant: "A",
};

const STATE = {
  observer: useMutationObserver(jfExperiment.ticketId),
};

const addVerticalThumbnailCarousel = async () => {
  try {
    elementReady(
      ".ghd-video-carousel-video-container .ghd-video-carousel-wrap",
      async (el) => {
        console.log("%cFFFFFFFOOOOOOUUUUUNDDDD", "background:red; color:#fff; font-size: 20px;");
        // get all the unique video elements
        const srcs = [];
        // [...document.querySelectorAll(".ghd-video-carousel-wrap .ghd-video-carousel-item")].forEach((video) => {
        //   const src = video.querySelector("source")?.getAttribute("src");
        //   if(!srcs.includes(src)) srcs.push(src)
        // });

        const videos = [...el.querySelectorAll(".ghd-video-carousel-item")]
          // .filter((video) => {
          //   const src = video.querySelector("source")?.getAttribute("src");
          //   if (!/DuetBlowdry24_USPVideo_Campaign_UK/gi.test(src)) return video;
          //   return null;
          // })
          .map((video) => {
            const src = video.querySelector("source")?.getAttribute("src");
            // check if we already got this src
            if (srcs.includes(src)) return null;
            srcs.push(src);
            // new src, keep it
            return video;
          })
          .filter((v) => !!v);

        const thumbnailHTML = `<div class="ghd_010112---container"> <div class="swiper swiper-container ghd_010112---carousel-container">
  <!-- Additional required wrapper -->
  <div class="swiper-wrapper">
    ${(function () {
      let html = "";
      videos.forEach((item) => {
        // added swiper class to identify that it will be the slide item
        item?.classList?.add("swiper-slide");
        // invisible has a hidden css in control. So, removed it to ensure the element shows properly
        item?.classList?.remove("invisible");
        // eslint-disable-next-line no-unsafe-optional-chaining
        html += item?.outerHTML;
      });
      return html;
    })()}
  </div>
  
    <!-- If we need navigation buttons -->
    <button class="swiper-button-prev">
      <svg xmlns="http://www.w3.org/2000/svg" width="23" height="13" viewBox="0 0 23 13" fill="none">
        <path d="M10.8146 0.795214L0.76145 11.4027C0.593623 11.5797 0.5 11.8149 0.5 12.0594C0.5 12.3039 0.593623 12.5391 0.76145 12.7161L0.77281 12.7275C0.854169 12.8136 0.9521 12.8821 1.06065 12.929C1.16919 12.9758 1.28608 13 1.40421 13C1.52234 13 1.63923 12.9758 1.74777 12.929C1.85632 12.8821 1.95425 12.8136 2.03561 12.7275L11.5019 2.73856L20.9644 12.7275C21.0457 12.8136 21.1437 12.8821 21.2522 12.929C21.3608 12.9758 21.4777 13 21.5958 13C21.7139 13 21.8308 12.9758 21.9394 12.929C22.0479 12.8821 22.1458 12.8136 22.2272 12.7275L22.2385 12.7161C22.4064 12.5391 22.5 12.3039 22.5 12.0594C22.5 11.8149 22.4064 11.5797 22.2385 11.4027L12.1854 0.795214C12.0969 0.701926 11.9906 0.627657 11.8728 0.576912C11.755 0.526166 11.6282 0.5 11.5 0.5C11.3718 0.5 11.245 0.526166 11.1272 0.576912C11.0094 0.627657 10.903 0.701926 10.8146 0.795214Z" fill="#C6A270"/>
      </svg>
    </button>
    <button class="swiper-button-next">
      <svg xmlns="http://www.w3.org/2000/svg" width="23" height="13" viewBox="0 0 23 13" fill="none">
        <path d="M10.8146 12.2048L0.76145 1.59727C0.593623 1.42028 0.5 1.18513 0.5 0.940602C0.5 0.696074 0.593623 0.46093 0.76145 0.283938L0.77281 0.272517C0.854169 0.186418 0.9521 0.117859 1.06065 0.0710096C1.16919 0.0241604 1.28608 9.53674e-07 1.40421 9.53674e-07C1.52234 9.53674e-07 1.63923 0.0241604 1.74777 0.0710096C1.85632 0.117859 1.95425 0.186418 2.03561 0.272517L11.5019 10.2614L20.9644 0.272517C21.0457 0.186418 21.1437 0.117859 21.2522 0.0710096C21.3608 0.0241604 21.4777 9.53674e-07 21.5958 9.53674e-07C21.7139 9.53674e-07 21.8308 0.0241604 21.9394 0.0710096C22.0479 0.117859 22.1458 0.186418 22.2272 0.272517L22.2385 0.283938C22.4064 0.46093 22.5 0.696074 22.5 0.940602C22.5 1.18513 22.4064 1.42028 22.2385 1.59727L12.1854 12.2048C12.0969 12.2981 11.9906 12.3723 11.8728 12.4231C11.755 12.4738 11.6282 12.5 11.5 12.5C11.3718 12.5 11.245 12.4738 11.1272 12.4231C11.0094 12.3723 10.903 12.2981 10.8146 12.2048Z" fill="#C6A270"/>
      </svg>
    </button>
  </div>
  </div>`;

        el?.insertAdjacentHTML("afterend", thumbnailHTML);

        const elementLoaded = await waitForElement(".ghd_010112---carousel-container");

        if (!elementLoaded) {
          console.log("carousel container hasn't added correctly!");
          emitEvent("error", jfExperiment);
          return;
        }

        const swiper = new Swiper(".ghd_010112---carousel-container", {
          direction: "vertical",
          modules: [Navigation],
          // grabCursor: true,
          speed: 1000,
          parallax: true,
          autoplay: false,
          effect: "slide",
          mousewheelControl: 1,
          centeredSlides: true,
          // centeredSlidesBounds: true,
          loop: true,
          initialSlide: 2,
          slidesPerView: 3,
          spaceBetween: 20,
          slidesPerGroup: 1,
          navigation: {
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev",
          },
          on: {
            click: function () {
              console.log("slide click:", this.clickedIndex, this.activeIndex);
              if (this.clickedIndex == this.activeIndex) return;
              if (this.clickedIndex < this.activeIndex) {
                swiper.slidePrev();
              } else if (this.clickedIndex > this.activeIndex) {
                swiper.slideNext();
              }
            },
            slideChange: function () {
              this.slides[this.activeIndex]?.click();
            },
          },
          breakpoints: {
            1024: {
              slidesPerView: 3,
              spaceBetween: 20,
              autoplay: false,
              centeredSlides: true,
              // centeredSlidesBounds: true,
            },
            641: {
              slidesPerView: 2,
              spaceBetween: 16,
              direction: "horizontal",
              speed: 800,
              navigation: false,
              slidesPerGroup: 1,
              centeredSlides: true,
              // centeredSlidesBounds: true,
            },
            0: {
              slidesPerView: 2,
              direction: "horizontal",
              spaceBetween: 16,
              speed: 800,
              navigation: false,
              slidesPerGroup: 1,
              centeredSlides: true,
              // centeredSlidesBounds: true,
            },
          },
        });

        console.log(swiper);
        window.GHD_010112 = swiper;

        // if (!!window.matchMedia("(max-width:768px)")?.matches) {
        //   swiper.on("click", function () {
        //     console.log("index", this.clickedIndex);
        //     swiper.slideTo(this.clickedIndex + 0.5);
        //   });
        // }
        // swiper.on("slideChange", function () {
        //   console.log("index", this);
        //   this.slides[this.activeIndex]?.click();
        // });
      },
      "GHD_010112-element"
    );
  } catch (e) {
    emitEvent("error", jfExperiment, e);
  }
};

const updatePosition = () => {
  if (
    !document.querySelector("cx-page-slot[position='Section2A'] app-ghd-product-get-creative-carousel") ||
    !document.querySelector("cx-page-slot[position='Section2B']")
  ) {
    console.log("Container not found or it has already moved!!!");
    return;
  }
  document
    .querySelector("cx-page-slot[position='Section2A'] app-ghd-product-get-creative-carousel")
    .before(document.querySelector("cx-page-slot[position='Section2B']"));
};

const watchForChanges = async () => {
  try {
    if (!!STATE.observer.details.isObserving) return;
    console.log("watching for changes");
    /** @type {Element} The Target element to listen for changes to */
    const target = await waitForElement("cx-page-layout");

    /** @type {MutationObserverInit} The MutationObserver options */
    const config = { childList: true, subtree: true };

    /** @type {MutationCallback} The Callback */
    const callback = (mutations) => {
      // console.log(callback);
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType !== 1) return;
          if (node?.classList?.contains("time-description")) return;
          if (!!node?.closest(".banners-bar")) return;
          console.log(mutation, "mutation");

          applyChanges();
        });
      });
    };
    /** Trigger the observer */
    STATE.observer.observe(target, config, callback);
  } catch (e) {
    emitEvent("error", jfExperiment, e.message);
  }
};

// const switchActiveState = (event) => {
//   console.log("switching active state");
//   console.log(event.target);
//   const activeElement = document.querySelector(
//     ".ghd_010112---container .ghd_010112---carousel-container.swiper-initialized .ghd-video-carousel-item.active"
//   );

//   if (activeElement) {
//     activeElement.classList.remove("active");
//   }

//   // Add active class to the element that is clicked
//   event?.target?.closest(".ghd-video-carousel-item").classList.add("active");
// };

const handleVideoClick = (e) => {
  console.log("video click");
  // FIXME: logic for changing the video src + playing it
  // return;
  const src = e?.target?.closest(".ghd-video-carousel-item")?.querySelector("video source")
    ? e?.target?.closest(".ghd-video-carousel-item")?.querySelector("video source").src
    : "";
  console.log(src);

  if (!src) {
    console.log("target element doesn't have any src attribute value");
    return;
  }

  const matchedElement = document.querySelector(
    `.ghd-video-carousel-video-container .ghd-video-carousel-wrap .ghd-video-carousel-item video source[src='${src}']`
  );
  console.log(matchedElement);

  if (!matchedElement) {
    console.log("no video element found matching the video source url");
    return;
  }

  console.log(matchedElement?.closest("video"));

  matchedElement?.closest("video")?.click();

  // NOTE: rather than clicking the video, let's just copy the src across to the current video ourselves?
  const mainVideo = document.querySelector("video.ghd-video-carousel-main-video");
  if (!!!mainVideo) {
    console.log("no main video?");
    return;
  }

  const source = document.createElement("source");
  source.src = src;
  source.type = "video/mp4";

  // pause it
  mainVideo?.pause();
  // remove current source
  mainVideo?.querySelector("source")?.remove();
  // add our new sauce
  mainVideo?.appendChild(source);
  // update attributes again
  setAttributes(mainVideo);
  // play it
  mainVideo?.load();
  mainVideo?.play();

  // console.log(mainVideo);
  // mainVideo.insertAdjacentHTML("beforeend", `<source src="${src}" type="video/mp4"`);

  // switch the active class between two videos
  // switchActiveState(e);
};

const applyChanges = () => {
  // DO STUFF
  try {
    elementReady(
      ".ghd_010112---container .ghd_010112---carousel-container.swiper-initialized .ghd-video-carousel-item",
      (el) => {
        console.log("CAROUSEL READY");
        el.removeEventListener("click", handleVideoClick);
        el.addEventListener("click", handleVideoClick);

        // the position may not be updated on previous run. Trying to do it again
        if (!document.querySelector("cx-page-slot[position='Section2A'] cx-page-slot[position='Section2B']")) {
          updatePosition();
        }
      },
      "GHD_010112---carousel-ready"
    );

    elementReady(
      `video.ghd-video-carousel-main-video:not([controls="true"])`,
      (el) => {
        console.log("MAIN VIDEO");
        setAttributes(el);
      },
      "GHD_010112--main-video"
    );
    // Update the position of the Discover More section if its found in the dom
    updatePosition();

    /*
    The current carousel is horizontal carousel and it's built in carousel which config can't be changed
    Hiding the current carousel and taking the data and create a new carousel on with vertical direction swipe
    Swiper library is used for the new carousel
  */
    addVerticalThumbnailCarousel();

    /*
    Check if the carousel is initialized correctly and the process is finished
    If it's not, we won't attach the click event
    the click event is to ensure the video is switched correctly on click and played accordingly
    It also switch the play icon between active and inactive videos.
  */

    insertStyle(style, "GHD_010112---style");
    insertStyle(swiperStyles, "GHD_010112---swiper-style");
  } catch (e) {
    emitEvent("error", jfExperiment, e);
  }
};

const setAttributes = (/** @type {Element} */ el) => {
  console.log("setting attributes");
  el.setAttribute("loop", true);
  el.setAttribute("controls", true);
  el.setAttribute("muted", true);
  el.setAttribute("autoplay", true);
  el.setAttribute("playsinline", "");
};

(async () => {
  try {
    const element2ALoaded = await waitForElement(
      "cx-page-slot[position='Section2A'] app-ghd-product-get-creative-carousel"
    );
    const element2BLoaded = await waitForElement("cx-page-slot[position='Section2B']");

    if (!element2ALoaded || !element2BLoaded) {
      console.log("not found the container");
      return;
    }
    applyChanges();

    watchForChanges();
  } catch (e) {
    emitEvent("error", jfExperiment, e);
  } finally {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: "Optimize-View",
      eventAction: `${jfExperiment.ticketId}`,
      eventLabel: "_2605818",
    });
  }
})();
