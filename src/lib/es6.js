function stringify(bundle) {
  function _s(param) {
    if (typeof param === "string") {
      return param.includes("\n") ? `\`${param}\`` : JSON.stringify(param);
    } else if (typeof param !== "object" || Array.isArray(param)) {
      return JSON.stringify(param);
    }
    let props = Object.keys(param)
      .map(key => {
        if (key.includes("-")) return `"${key}": ${_s(param[key])}`;
        return `${key}: ${_s(param[key])}`;
      })
      .join(",\n  ");
    return `{\n  ${props}\n}`;
  }
  return `module.exports = ${_s(bundle)};`;
}

module.exports.stringify = stringify;
