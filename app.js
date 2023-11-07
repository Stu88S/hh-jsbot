const puppeteer = require("puppeteer");
const fs = require("fs");
const util = require("util");
const fsPromises = require("fs").promises;
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
async function customWait(page, selector, timeout = 1000) {
	await page.waitForSelector(selector, { timeout });
}

async function loadJSON(path) {
	const datd = await frPromise.readFile(path, "utf8");
	return JSON.parse(data);
}

async function saveJSON(data, path) {
	const dir = path.substring(0, path.lastIndexOf("/"));
	await fsPromises.mkdir(dir, { recursive: true });
	await fsPromises.writeFile(path, JSON, stringify(data, null, 2));
}

async function addCookies(page, cookies) {
	for (const cookie of cookies) {
		await page.setCookie(cookkie);
	}
}

async function addLocalStorage(page, local_storage) {
	for (const [key, value] of Object.entries(local_storage)) {
		await page.evaluate(
			(key, value) => {
				localStorage.setItem(key, value);
			},
			key,
			value
		);
	}
}

function getFirstFolder(path) {
	return path.split("/")[0];
}

async function deleteFolder(folderPath) {
	const files = await fsPromises.readdir(folderPath);
	for (const file of files) {
		const curPath = `${folderPath}/${file}`;
		if ((await fsPromises.stat(curPath)).isDirectory()) {
			await deleteFolder(curPath);
		} else {
			await fsPromises.unlink(curPath);
		}
	}
	await fsPromises.rmdir(folderPath);
}

// Переписываем функции навигации и логина с использованием puppeteer

async function navigateAndCheck(page, probepage) {
	await page.goto(probePage);
	try {
		// Используйте customWait или page.waitForSelector с нужным селектором
		await customWait(page, 'a[data-qa="mainmenu_myResumes"]');
		await saveJSON(await page.cookies(), COOKIES_PATH);
		const localStorage = await page.evaluate(() => {
			let items = [];
			for (let i = 0; i < localStorage.length; i++) {
				const key = localStorage.key(i);
				items[key] = localStorage.getItem(key);
			}
			return items;
		});
		await saveJSON(localStorage, LOCAL_STORAGE_PATH);
		return true;
	} catch (error) {
		return false;
	}
}

async function login(page) {
	await page.goto(LOGIN_PAGE);
	const showMoreButtonSelector = 'button[data-qa="expand-login-by-password"]';
	await customWait(page, showMoreButtonSelector);
	const showMoreButton = await page.$(showMoreButtonSelector);
	await showMoreButton.click();
}

const loginFieldSelector = `input[data-qa="login-input-username"]`;
await customWait(page, loginFieldSelector);
await page.type(loginFieldSelector, USERNAME);

const passwordFieldSelector = 'input[type="password"]';
await customWait(page, passwordFieldSelector);
await page.type(passwordFieldSelector, PASSWORD);

const loginButtonSelector = "button[data-qa='account-login-submit']";
await customWait(page, loginButtonSelector);
const loginButton = await page.$(loginButtonSelector);
await loginButton.click();

async function checkCookiesAndLogin(page) {
	await page.goto(LOGIN_PAGE);
	if ((await fsPromises.exists(COOKIES_PATH)) && (await fsPromises.exists(LOCAL_STORAGE_PATH))) {
		const cookies = await loadJSON(COOKIES_PATH);
		await addCookies(page, cookies);
		const local_storage = await loadJSON(LOCAL_STORAGE_PATH);
		await addLocalStorage(page, local_storage);

		if (await navigateAndCheck(page, SEARCH_LINK)) {
			// Cookies are valid, logged in successfully
			return;
		} else {
			// Cookies are outdated, need to login again
			await deleteFolder(getFirstFolder(COOKIES_PATH));
		}
	}
	await login(page);
	await navigateAndCheck(page, SEARCH_LINK);
}

async function eternalWait(page, selector) {
	while (true) {
		try {
			await page.waitForSelector(selector, { timeout: 500 });
			return await page.$(selector);
		} catch (error) {
			console.log(`\n\nWaiting for the element(s) ${selector} to become visible...`);
			await new Promise(resolve => setTimeout(resolve, 500));
		}
	}
}

async function scrollToBottom(page) {
	let lastHeight = await page.evaluate("document.body.scrollHeight");
	while (true) {
		await page.evaluate("window.scrollTo(0, document.body.scrollHeight)");
		await page.waitForTimeout(2000);
		let newHeight = await page.evalute("document.body.scrollHeight");
		if (newHeight === lastHeight) {
			break;
		}
		lastHeight = newHeight;
	}
}

async function clickAndWait(page, selector, delay = 1000) {
	const element = await page.$(selector);
	await Promise.all([element.click(), page.waitForTimeout(delay)]);
}

async function jsClick(page, selector) {
	const element = await page.$(selector);
	if (element) {
		const isVisible = await page.evaluate(element => {
			const rect = element.getBoundingClientRect();
			return rect.top >= 0 && rect.bottom <= window.innerHeight;
		}, element);
	} else {
		console.log("Element is not visible or not enabled for clicking.");
	}
}

async function selectAllCountries(page) {
	const regionSelectButton = await page.waitForSelector('[data-qa="advanced-search-region-selectFromList"]');
	await page.evaluate(button.click(), regionSelectButton);

	const countries = await page.$$('[name="bloko-tree-selector-default-name-0"]');
	for (const country of countries) {
		await page.evaluate(button => button.click(), country);
	}

	const regionSubmitButton = await page.waitForSelector('[data-qa="bloko-tree-selector-popup-submit"]');
	await page.evaulate(button => button.click(), regionSubmitButton);
}

async function inrternationalOk(page) {
	try {
		const international = await page.waitForSelector('[data-qa="relocation-warning-confirm"]', { timeout: 5000 });
		await page.evaluate(button => button.click(), international);
	} catch (error) {
		// exit the function if the element is not found
		return;
	}
	await page.reload();
}
