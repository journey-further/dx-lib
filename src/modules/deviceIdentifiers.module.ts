export const isIphone = (): boolean => /iPhone/i.test(navigator.userAgent);

export const isMobile = (): boolean =>
  /iPhone|Android|Opera Mini|Blackberry|Windows Phone|IEMobile/i.test(
    navigator.userAgent
  );
