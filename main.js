const puppeteer = require("puppeteer");
const fs = require("fs");
const util = require("util");
const fsPromises = require("fs").promises;
const settings = require("./config/settings");

// Clearing the console for readability
console.clear();

const Status = Object.freeze({
	SUCESS: 0,
	FAILURE: 1,
});

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

function getFirstFolder(path) {
	return path.split("/")[0];
}

async function main() {
	const browser = await puppeteer.launch({ headless: false });
	const page = await browser.newPage();

	// Check cookies and login
	await checkCookiesAndLogin(page, LOGIN_PAGE);

	// Perform advanced search or use a custom query if available
	if (ADVANCED_SEARCH_URL_QUERY) {
		await page.goto(ADVANCED_SEARCH_URL_QUERY);
	} else {
		await advancedSearch(page, JOB_SEARCH_QUERY);
	}

	let counter = 0;
	const MAX_APPLICATIONS = 200; // Set this to the limit you want

	// Loop to apply to jobs
	while (counter < MAX_APPLICATIONS) {
		let status = await clickAllJobsOnThePage(page);
		if (status === Status.FAILURE) {
			console.log("Error or all job links clicked.");
			break;
		}

		// Logic to navigate to the next page of search results
		// Replace 'next_page_selector' with the actual selector for the "next page" button
		try {
			await page.click("next_page_selector");
		} catch (error) {
			console.log("No more pages or hh.ru unresponsive.");
			break;
		}

		counter += 1; // Increment the counter after each successful loop
	}

	console.log("Script completed. Total applications sent:", counter);
	await browser.close();
}

main();
