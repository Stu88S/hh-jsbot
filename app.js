const puppeteer = require("puppeteer");
const fs = require("fs");
const util = require("util");
const settings = require("./config/settings");

const readFileAsync = util.promisify(fs.readFile);
const writeFileAsync = util.promisify(fs.writeFile);
const mkdirAsync = util.promisify(fs.mkdir);
const readdirAsync = util.promisify(fs.readdir);
const rmdirAsync = util.promisify(fs.rmdir);
const unlinkAsync = util.promisify(fs.unlink);

// Clearing the console for readability
console.clear();

const Status = Object.freeze({
	SUCESS: 0,
	FAILURE: 1,
});

async function readTextFile(relativePath, fileName) {
	const filePath = `${relativePath}/${fileName}`;
	return await readFileAsync(filePath, { encoding: "utf-8" });
}

// Initialization of settings
const MESSAGE = await readTextFile("resources", "cover-letter-ru.txt");
const ANSWER = await readTextFile("resources", "links-list.txt");

const USER_AGENT = settings.USER_AGENT;
const COOKIES_PATH = settings.COOKIES_PATH;
const LOCAL_STORAGE_PATH = settings.LOCAL_STORAGE_PATH;
const USERNAME = settings.USERNAME;
const PASSWORD = settings.PASSWORD;
const LOGIN_PAGE = settings.LOGIN_PAGE;
const JOB_SEARCH_QUERY = settings.JOB_SEARCH_QUERY;
const EXCLUDE = settings.EXCLUDE;
const REGION = settings.REGION;
const SEARCH_LINK = settings.SEARCH_LINK;
const MIN_SALARY = settings.MIN_SALARY;
const ONLY_WITH_SALARY = settings.ONLY_WITH_SALARY;

const ADVANCED_SEARCH_URL_QUERY = settings.ADVANCED_SEARCH_URL_QUERY;

// Puppeteer browser setup
const browser = await puppeteer.launch({
	headless: false,
	args: ["--start-maximized", `--user-agent=${USER_AGENT}`],
});

const page = await browser.newPage();
await page.setViewport({ width: 3440, height: 1440 });
await page.setUserAgent(USER_AGENT);

// Custom wait function using puppeteer
async function customWait(page, selector, timeot = 1000) {
	await page.waitForSelector(selector, { timeoout });
}
