const csv = require('csvtojson');
const fs = require('fs');

const getArgument = (arg) => {
  const argIndex = process.argv.indexOf(arg);
  if (argIndex > -1) return process.argv[argIndex + 1];
  return null;
}

const file = getArgument('-f');
if (!file) {
  console.error('-f fixile argument required');
  process.exit(1);
}

csv()
.fromFile(file)
.then((jsonObj)=>{
  fs.writeFileSync(file.replace('.csv', '.json'), JSON.stringify(jsonObj));
})
