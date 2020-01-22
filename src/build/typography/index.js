const { toPairs, keys } = require("ramda");
const specification = require("./spec");
const typefaces = require("./typefaces");
const yargs = require("yargs");
const fs = require("fs");

const argv = yargs
  .option("theme", {
    alias: "t",
    description: "Selects the fonts to ouput",
    choices: ["main", "ios", "material", "ios-mono", "material-mono"]
  })
  .option("monospace", {
    alias: "m",
    description: "Whether to use monospace fonts to generate the output",
    type: "boolean"
  })
  .option("all", {
    alias: "a",
    description: "Generate all variants for output",
    type: "boolean"
  })
  .help()
  .alias("help", "h").argv;

const rootEm = 16; // px
const typeGrid = 4; // dp
const typeScale = {};

const matchWeight = (weight, availableWeights) =>
  parseInt(
    availableWeights.reduce((prev, curr) =>
      Math.abs(curr - weight) < Math.abs(prev - weight) ? curr : prev
    )
  );

const theme = require(`./themes/${argv.theme}`);

toPairs(specification).map(([scaleCategory, spec]) => {
  const themeSpec = theme[scaleCategory];
  const log = s => console.log(`[${scaleCategory}]\t${s}`);
  const pick = name => (themeSpec[name] ? themeSpec[name] : spec[name]);
  const fontFamily = pick("typeface");
  const selectedTypeface = typefaces[fontFamily];
  if (!selectedTypeface) log(`Error: Typeface not available: ${fontFamily}`);

  let fontWeight = pick("weight");
  const matchedWeight = matchWeight(fontWeight, keys(selectedTypeface));
  if (matchedWeight !== fontWeight) {
    log(`Warning: Weight ${matchedWeight} not available, using ${fontWeight}`);
    fontWeight = matchedWeight;
  }

  const selectedFont = selectedTypeface[fontWeight]();

  // can be substituted for this version of Roboto
  // const robotoXHeight = 0.5283203125;
  const specFont = typefaces[spec.typeface][spec.weight]();
  const specXHeight = specFont.xHeight / specFont.unitsPerEm;
  const themeXHeight = selectedFont.xHeight / selectedFont.unitsPerEm;
  const relativeXHeight = themeXHeight / specXHeight;

  const fontSizePx = relativeXHeight * pick("size");
  const fontSize = `${fontSizePx / rootEm}rem`;
  const letterSpacing = `${spec.tracking / fontSizePx}rem`;
  const lineHeight = `${pick("lineHeight")}rem`;

  if (pick("lineHeight") < fontSizePx / rootEm) {
    log(
      `Warning: line height (${lineHeight}) is smaller than font size ${fontSize} `
    );
  }

  typeScale[scaleCategory] = {
    fontFamily,
    fontWeight,
    fontSize,
    letterSpacing,
    lineHeight
  };
});
const ext = (type = "sass") => {
  if (type === "sass") return ".scss";
  else if (type === "less") return ".less";
  else return `.${type}`;
};
// console.log(robotoXHeight, robotoXHeight2);
const outputType = "less";
let result = toPairs(typeScale).reduce((p, [scaleCategory, spec]) => {
  const template = (type = "sass") => {
    if (type === "sass")
      return `$mdc-typography-styles-${scaleCategory}: (
  font-family: unquote("${spec.fontFamily}"),
  font-weight: ${spec.fontWeight},
  font-size: ${spec.fontSize},
  letter-spacing: ${spec.letterSpacing},
  line-height: ${spec.lineHeight}
);
`;
    else if (type === "less")
      return `.${scaleCategory} {
    font-family: ${spec.fontFamily};
    font-weight: ${spec.fontWeight};
    font-size: ${spec.fontSize};
    letter-spacing: ${spec.letterSpacing};
    line-height: ${spec.lineHeight};
}`;
  };
  return p + template(outputType);
}, "");

if (outputType === "less") {
  result = `#typography() {
${result}
}`;
}
const tryMkdir = dir => {
  try {
    fs.mkdirSync(dir);
  } catch (e) {}
};
tryMkdir("./dist/typography");
const file = `./dist/typography/${argv.theme}${
  argv.monospace ? "-mono" : ""
}${ext(outputType)}`;
fs.writeFileSync(file, result);
console.log(`Created ${file}`);
// console.log(result);

// toPairs(typeScale).map(([scaleCategory, spec]) => {
//   console.log(`&.mdc-typography--${scaleCategory} {
//   $line-height: ${spec.lineHeight};
//   @include mdc-typography-baseline-top($line-height);
//   @include mdc-typography-baseline-bottom($line-height);
// }`);
// });
