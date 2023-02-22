export const isWtoPreview = () => {
  if (/_wt\.pid=[a-zA-Z0-9]+/gi.test(window.location.search)) return true;
  if (/_wt\.bdebug=true/gi.test(document.cookie)) return true;
  return false;
};
