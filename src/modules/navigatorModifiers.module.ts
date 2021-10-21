export const redirect = (url: string): void => {
  if (!url) return;
  window.location.href = url;
};
