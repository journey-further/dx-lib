import postCssPreset from "postcss-preset-env";
import nested from "postcss-nested";
import mixins from "postcss-mixins";
import simpleVars from "postcss-simple-vars";
import minmax from "postcss-media-minmax";
import rgba from "postcss-color-rgba-fallback";
import nano from "cssnano";
import autoPrefixer from "autoprefixer";

export default {
  plugins: [
    postCssPreset,
    nested,
    mixins,
    minmax(),
    simpleVars,
    rgba,
    autoPrefixer({
      overrideBrowserslist: ["> 0.1%", "not dead", "iOS 7"],
    }),
    nano,
  ],
};
