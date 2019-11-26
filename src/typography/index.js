const { toPairs } = require("ramda");
const specification = require("./spec");
const theme = require("./theme");
const typefaces = require("./typefaces");

const rootEm = 16; // px
const typeGrid = 4; // dp
const typeScale = {};
const native = {
  ios: "SF Pro Text"
};

toPairs(specification).map(([scaleCategory, spec]) => {
  const themeSpec = theme[scaleCategory];
  // const themeSpec = {
  //   typeface: native.ios,
  //   weight: spec.weight
  // };

  const pick = name => (themeSpec[name] ? themeSpec[name] : spec[name]);
  const selectedTypeface = typefaces[themeSpec.typeface][themeSpec.weight];
  // const robotoXHeight = 0.5283203125;
  const robotoXHeight =
    typefaces.Roboto[spec.weight].xHeight /
    typefaces.Roboto[spec.weight].unitsPerEm;
  const themeXHeight = selectedTypeface.xHeight / selectedTypeface.unitsPerEm;
  const relativeXHeight = themeXHeight / robotoXHeight;

  const fontSizePx = relativeXHeight * pick("size");
  const fontSize = `${fontSizePx / rootEm}rem`;
  const letterSpacing = `${spec.tracking / fontSizePx}rem`;
  const lineHeight = `${pick("lineHeight")}rem`;

  if (pick("lineHeight") < fontSizePx / rootEm) {
    console.log(
      `Warning: line height (${lineHeight}) is smaller than font size ${fontSize} `
    );
  }

  typeScale[scaleCategory] = {
    fontFamily: themeSpec.typeface,
    fontWeight: themeSpec.weight,
    fontSize,
    letterSpacing,
    lineHeight
  };
});

// console.log(robotoXHeight, robotoXHeight2);
toPairs(typeScale).map(([scaleCategory, spec]) => {
  console.log(`$mdc-typography-styles-${scaleCategory}: (
  font-family: unquote("${spec.fontFamily}"),
  font-weight: ${spec.fontWeight},
  font-size: ${spec.fontSize},
  letter-spacing: ${spec.letterSpacing},
  line-height: ${spec.lineHeight}
);`);
});

// toPairs(typeScale).map(([scaleCategory, spec]) => {
//   console.log(`&.mdc-typography--${scaleCategory} {
//   $line-height: ${spec.lineHeight};
//   @include mdc-typography-baseline-top($line-height);
//   @include mdc-typography-baseline-bottom($line-height);
// }`);
// });
