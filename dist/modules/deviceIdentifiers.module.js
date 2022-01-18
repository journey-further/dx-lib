export const isIphone = () => /iPhone/i.test(navigator.userAgent);
export const isMobile = () => /iPhone|Android|Opera Mini|Blackberry|Windows Phone|IEMobile/i.test(navigator.userAgent);
export const insertStyle = (style, ticket) => {
    if (!!!document.querySelector('#'+ticket)) {
      document.body.insertAdjacentHTML(
        "beforeend",
        `<style id="`+ticket+`">${style.toString()}</style>`
      );
    }
  };