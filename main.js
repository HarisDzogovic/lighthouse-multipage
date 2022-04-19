const lighthouse = require("lighthouse");
const chromeLauncher = require("chrome-launcher");
const fs = require("fs");

const config = JSON.parse(fs.readFileSync("config.json"));
const reportFolder = config.reportDir;
const lighthouseFlags = config.lighthouseFlags;
const chromeFlags = config.chromeFlags;
const pages = JSON.parse(fs.readFileSync("pages.json")).pages;

function createDestinationName(urlName,timestamp , folderName, fileType) {
  const fileName = urlName + "_" + timestamp + "." + fileType;
  return folderName + fileName;
}

function createReport(folderName, destination, content) {
  fs.mkdir(folderName, { recursive: true }, (err) => {
    if (err) {
      console.log(err);
    } else {
      fs.writeFileSync(destination, content, (err) => {
        if (err) {
          console.log(err);
        } else {
          console.log("Saved to " + destination);
        }
      });
    }
  });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

switch (process.env.EMULATION) {
  case "Mobile":
    lighthouseFlags.screenEmulation = { disabled: false };
    lighthouseFlags.formFactor = "mobile";
    lighthouseFlags.throttlingMethod = "simulate";
    break;
  case "Desktop":
    lighthouseFlags.screenEmulation = { disabled: true };
    lighthouseFlags.formFactor = "desktop";
    lighthouseFlags.throttlingMethod = "provided";
    break;
  default:
    console.log(`Set EMULATION to "mobile" or "desktop"`);
    //Abort execution
    process.exit(1);
}

console.log(config);

(async () => {
  for (let i = 0; i < pages.length; i++) {
    console.log("Starting on " + pages[i].name + " (" + pages[i].url + ")");
    // In some cases the browser crashed on launch with multipages, with a small sleep this scenario did not happen anymore.
    await sleep(500);
    const timestamp = Date.now();
    const chrome = await chromeLauncher.launch({ chromeFlags });
    lighthouseFlags.port = chrome.port;
    const rawResult = await lighthouse(pages[i].url, lighthouseFlags);

    const htmlReportDestination = createDestinationName(
      pages[i].name,
      timestamp,
      reportFolder,
      "html"
    );

    const jsonReportDestination = createDestinationName(
      pages[i].name,
      timestamp,
      reportFolder,
      "json"
    );

    const htmlReportContent = rawResult.report;
    const rawJsonReportContent = rawResult.lhr.audits;

    //Relevant metrics are here
    const jsonReportContent = {
      performance: rawResult.lhr.categories.performance.score * 100,
      "first-contentful-paint":
        rawJsonReportContent["first-contentful-paint"].numericValue,
      "largest-contentful-paint":
        rawJsonReportContent["largest-contentful-paint"].numericValue,
      "first-meaningful-paint":
        rawJsonReportContent["first-meaningful-paint"].numericValue,
      "speed-index": rawJsonReportContent["speed-index"].numericValue,
      "total-blocking-time":
        rawJsonReportContent["total-blocking-time"].numericValue,
      "max-potential-fid":
        rawJsonReportContent["max-potential-fid"].numericValue,
      "cumulative-layout-shift":
        rawJsonReportContent["cumulative-layout-shift"].numericValue,
      "server-response-time":
        rawJsonReportContent["server-response-time"].numericValue,
      interactive: rawJsonReportContent["interactive"].numericValue,
      timestamp: "",
    };

    createReport(reportFolder, htmlReportDestination, htmlReportContent);
    createReport(
      reportFolder,
      jsonReportDestination,
      JSON.stringify(jsonReportContent)
    );

    console.log(
      "Performance score of " +
        pages[i].url +
        " was " +
        rawResult.lhr.categories.performance.score * 100
    );
    await chrome.kill();
  }
})();
