const fontkit = require("fontkit");

const root = "./brand/fonts";
const o = s => () => fontkit.openSync(`${root}/${s}`);
module.exports = {
  Roboto: {
    100: o("roboto/Roboto-Thin.ttf"),
    300: o("roboto/Roboto-Light.ttf"),
    400: o("roboto/Roboto-Regular.ttf"),
    500: o("roboto/Roboto-Medium.ttf"),
    700: o("roboto/Roboto-Bold.ttf"),
    900: o("roboto/Roboto-Black.ttf")
  },
  Lato: {
    100: o("lato/Lato-Hairline.ttf"),
    200: o("lato/Lato-Thin.ttf"),
    300: o("lato/Lato-Light.ttf"),
    400: o("lato/Lato-Regular.ttf"),
    500: o("lato/Lato-Medium.ttf"),
    600: o("lato/Lato-Semibold.ttf"),
    700: o("lato/Lato-Bold.ttf"),
    800: o("lato/Lato-Heavy.ttf"),
    900: o("lato/Lato-Black.ttf")
  },
  "Google Sans": {
    400: o("google-sans/GoogleSans-Regular.ttf"),
    500: o("google-sans/GoogleSans-Medium.ttf"),
    700: o("google-sans/GoogleSans-Bold.ttf")
  },
  "SF Pro Text": {
    100: o("sf-pro-text/SF-Pro-Text-Ultralight.otf"),
    200: o("sf-pro-text/SF-Pro-Text-Thin.otf"),
    300: o("sf-pro-text/SF-Pro-Text-Light.otf"),
    400: o("sf-pro-text/SF-Pro-Text-Regular.otf"),
    500: o("sf-pro-text/SF-Pro-Text-Medium.otf"),
    600: o("sf-pro-text/SF-Pro-Text-Semibold.otf"),
    700: o("sf-pro-text/SF-Pro-Text-Bold.otf"),
    800: o("sf-pro-text/SF-Pro-Text-Heavy.otf"),
    900: o("sf-pro-text/SF-Pro-Text-Black.otf")
  },
  "SF Pro Display": {
    100: o("sf-pro-display/SF-Pro-Display-Ultralight.otf"),
    200: o("sf-pro-display/SF-Pro-Display-Thin.otf"),
    300: o("sf-pro-display/SF-Pro-Display-Light.otf"),
    400: o("sf-pro-display/SF-Pro-Display-Regular.otf"),
    500: o("sf-pro-display/SF-Pro-Display-Medium.otf"),
    600: o("sf-pro-display/SF-Pro-Display-Semibold.otf"),
    700: o("sf-pro-display/SF-Pro-Display-Bold.otf"),
    800: o("sf-pro-display/SF-Pro-Display-Heavy.otf"),
    900: o("sf-pro-display/SF-Pro-Display-Black.otf")
  },
  "Roboto Mono": {
    400: o("roboto-mono/RobotoMono-Regular.ttf"),
    500: o("roboto-mono/RobotoMono-Medium.ttf")
  },
  "SF Mono": {
    400: o("sf-mono/SFMono.ttf")
  }
};
