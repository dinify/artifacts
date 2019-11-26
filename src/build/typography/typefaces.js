const fontkit = require("fontkit");

const root = "./brand/fonts";
module.exports = {
  Roboto: {
    300: fontkit.openSync(`${root}/roboto/Roboto-Light.ttf`),
    400: fontkit.openSync(`${root}/roboto/Roboto-Regular.ttf`),
    500: fontkit.openSync(`${root}/roboto/Roboto-Medium.ttf`)
  },
  Lato: {
    400: fontkit.openSync(`${root}/lato/Lato-Regular.ttf`),
    500: fontkit.openSync(`${root}/lato/Lato-Medium.ttf`)
  },
  "Google Sans": {
    400: fontkit.openSync(`${root}/google-sans/GoogleSans-Regular.ttf`),
    500: fontkit.openSync(`${root}/google-sans/GoogleSans-Medium.ttf`),
    700: fontkit.openSync(`${root}/google-sans/GoogleSans-Bold.ttf`)
  },
  "SF Pro Text": {
    300: fontkit.openSync(`${root}/sf-pro-text/SF-Pro-Text-Light.otf`),
    400: fontkit.openSync(`${root}/sf-pro-text/SF-Pro-Text-Regular.otf`),
    500: fontkit.openSync(`${root}/sf-pro-text/SF-Pro-Text-Medium.otf`),
    700: fontkit.openSync(`${root}/sf-pro-text/SF-Pro-Text-Bold.otf`)
  }
};
