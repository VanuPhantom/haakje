// Get the file name
const arguments = process.argv.slice(2);
if (arguments.length !== 1) {
  console.error("Expected a file name!\n\rSyntax: node preprocess.js <file>");
  process.exitCode = 1;
  exit();
}

const [fileName] = arguments;

// Load the raw HTML
const fs = require("fs");
const fileContents = fs.readFileSync(fileName).toString();

// Initiate the DOM
var jsdom = require("jsdom");
const { JSDOM } = jsdom;
const { window } = new JSDOM(fileContents);
const { document } = new JSDOM(fileContents).window;
global.window = window;
global.document = document;

// Process the raw HTML
const $ = require("jquery");
$("[x-include]").each((index, element) => {
  $(element).text(
    fs.readFileSync(element.getAttribute("x-include")).toString()
  );
  element.removeAttribute("x-include");
});

// Output the result
console.log($("html").prop("outerHTML"));
