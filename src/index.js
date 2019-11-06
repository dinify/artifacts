require("dotenv").load();

const fs = require("fs");

console.log("Available scripts");
console.log(fs.readdirSync(".").join(",\n"));
