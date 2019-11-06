const fs = require('fs');
const cliProgress = require('cli-progress');
const readline = require('readline');
const exec = require('child_process').exec;

const getArgument = (arg) => {
  const argIndex = process.argv.indexOf(arg);
  if (argIndex > -1) return process.argv[argIndex + 1];
  return null;
}

const udf = getArgument('--udf');
if (!udf) {
  console.error('--udf user defined function file argument required');
  process.exit(1);
}

const dataFile = getArgument('--data');
if (!dataFile) {
  console.error('--data data file argument required');
  process.exit(1);
}

const outFile = getArgument('--out');
if (!outFile) {
  console.error('--out output file argument required');
  process.exit(1);
}

let func = getArgument('-f');
if (!func) func = 'transform';

let wrapFunc = getArgument('-w');
if (!wrapFunc) wrapFunc = 'wrap';

const javascript = fs.readFileSync(udf).toString();
eval(javascript);

let wrapper = null;
if (process.argv.indexOf('-w') > -1) wrapper = eval(`${wrapFunc}()`);

exec(`wc ${dataFile}`, function (error, wcResults) {
  const dataLength = parseInt(wcResults.split(' ').filter(l => l !== '')[0]);

  // Progress bar
  const total = dataLength;
  const progressBar = new cliProgress.Bar({
    fps: 60,
    format: 'Progress: [{bar}] {percentage}% | {value}/{total}'
  }, cliProgress.Presets.shades_classic);
  progressBar.start(total, 0);
  let progressCounter = 0;

  const writeStream = fs.createWriteStream(outFile);
  const readStream = fs.createReadStream(dataFile);

  const readlineInterface = readline.createInterface({
    input: readStream,
    crlfDelay: Infinity
  });

  if (wrapper) {
    writeStream.write(wrapper.prefix);
  }
  let cnt = 0;
  readlineInterface.on('line', (line) => {
    readStream.pause();

    if (line) {
      const json = JSON.parse(line);
      const evalString = `${func}(${JSON.stringify(json)})`;
      const lineResult = eval(evalString);
	if (!lineResult.language_distribution) cnt++;
      writeStream.write(lineResult + (wrapper ? ',' : '\n'));
    }

    progressCounter++;
    progressBar.update(progressCounter);

    readStream.resume();
  });

  readlineInterface.on('error', function(err){
    console.log('Error while reading file.', err);
  });

  readlineInterface.on('close', () => {
    if (wrapper) {
      writeStream.write(wrapper.suffix);
    }
    writeStream.end();
    progressBar.stop();
    console.log('Success!');
    console.log('Number of restaurants that have undefined or null langDist: ' + cnt);
  });
});
