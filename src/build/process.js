const { buildMessageMatcher, parseMessagePattern } = require("@phensley/cldr");
const { toPairs } = require("ramda");
const messageMatcher = buildMessageMatcher([]);
const parse = message => parseMessagePattern(message, messageMatcher);

const filter = ["0 list and"];
const preprocess = messageformats => {
  const output = [];
  const map = {};
  messageformats.forEach((messageformat, idx) => {
    const parsed = parse(messageformat);
    const text = [];
    const recurse = p => {
      if (Array.isArray(p)) {
        if (p.length === 2 && p[0] === 0) {
          if (!filter.includes(p[1])) text.push(p[1].trim());
        } else {
          try {
            p.forEach(e => recurse(e));
          } catch (e) {
            console.log(e, p);
          }
        }
      }
    };
    recurse([parsed]);
    if (text.length > 1) {
      map[idx] = [
        output.length,
        text.length,
        messageformat,
        text.sort((a, b) => b.length - a.length)
      ];
    } else map[idx] = output.length;
    output.push(...text);
  });
  return { input: output, map };
};

const postprocess = (input, map) => {
  const result = [];
  const special = [];
  toPairs(map).forEach(([idx, val]) => {
    if (Array.isArray(val)) {
      let [k, l, mf, text] = val;
      // k is pointer in input array
      // l is length of array
      const arr = input.filter((t, i) => i >= k && i < k + l);
      text.forEach((tx, i) => {
        mf = mf.replace(tx, arr[i]);
      });
      special.push(mf);
      result[idx] = mf;
    } else result[idx] = input[val];
  });
  return result;
};

exports.preprocess = preprocess;
exports.postprocess = postprocess;
