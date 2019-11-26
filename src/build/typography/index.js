const { toPairs } = require("ramda");
const specification = require("./spec");
const theme = require("./theme");
const typefaces = require("./typefaces");
const yargs = require("yargs");
const fs = require("fs");

const argv = yargs
  .option("theme", {
    alias: "t",
    description: "Selects the fonts to ouput",
    choices: ["main", "ios", "material"]
  })
  .help()
  .alias("help", "h").argv;

const rootEm = 16; // px
const typeGrid = 4; // dp
const typeScale = {};
const native = {
  ios: "SF Pro Text",
  material: "Roboto"
};

toPairs(specification).map(([scaleCategory, spec]) => {
  const themeSpec =
    argv.theme === "main"
      ? theme[scaleCategory]
      : {
          typeface: native[argv.theme],
          weight: spec.weight, // original spec weight
          lineHeight: theme[scaleCategory].lineHeight // corrected lineheight
        };

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
const result = toPairs(typeScale).reduce((p, [scaleCategory, spec]) => {
  return (
    p +
    `$mdc-typography-styles-${scaleCategory}: (
  font-family: unquote("${spec.fontFamily}"),
  font-weight: ${spec.fontWeight},
  font-size: ${spec.fontSize},
  letter-spacing: ${spec.letterSpacing},
  line-height: ${spec.lineHeight}
);
`
  );
}, "");
const tryMkdir = dir => {
  try {
    fs.mkdirSync(dir);
  } catch (e) {}
};
tryMkdir("./dist/typography");
fs.writeFileSync(`./dist/typography/${argv.theme}.scss`, result);
console.log(`Created ./dist/typography/${argv.theme}.scss`);
// console.log(result);

// toPairs(typeScale).map(([scaleCategory, spec]) => {
//   console.log(`&.mdc-typography--${scaleCategory} {
//   $line-height: ${spec.lineHeight};
//   @include mdc-typography-baseline-top($line-height);
//   @include mdc-typography-baseline-bottom($line-height);
// }`);
// });
