const puppeteer = require("puppeteer");
const { checkCookiesAndLogin } = require("./authentication/login");
const { advancedSearch } = require("./search/advancedSearch");
const { clickAllJobsOnThePage } = require("./application/jobApplication");
const { readTextFile } = require("./utils/files");
const settings = require("./config/settings");

// Removed fs and util as they are not needed anymore
// Removed getFirstFolder function if it's not used

(async () => {
	try {
		console.clear();
		const Status = Object.freeze({ SUCCESS: 0, FAILURE: 1 });
		const MESSAGE = await readTextFile("./resources", "cover-letter-ru.txt");
		const ANSWER = await readTextFile("./resources", "links-list.txt");
		const USER_AGENT = settings.USER_AGENT;
		const LOGIN_PAGE = settings.LOGIN_PAGE;
		const JOB_SEARCH_QUERY = settings.JOB_SEARCH_QUERY;
		const ADVANCED_SEARCH_URL_QUERY = settings.ADVANCED_SEARCH_URL_QUERY;
		const MAX_APPLICATIONS = 200; // Set this to the limit you want

		const browser = await puppeteer.launch({
			headless: false,
			args: ["--start-maximized", `--user-agent=${USER_AGENT}`],
		});
		const page = await browser.newPage();
		await page.setViewport({ width: 3440, height: 1440 });
		await page.setUserAgent(USER_AGENT);

		await checkCookiesAndLogin(page, LOGIN_PAGE);

		if (ADVANCED_SEARCH_URL_QUERY) {
			await page.goto(ADVANCED_SEARCH_URL_QUERY);
		} else {
			await advancedSearch(page, JOB_SEARCH_QUERY);
		}

		let counter = 0;
		while (counter < MAX_APPLICATIONS) {
			let status = await clickAllJobsOnThePage(page, MESSAGE, ANSWER);
			if (status === Status.FAILURE) {
				console.log("Error or all job links clicked.");
				break;
			}

			// Replace 'next_page_selector' with the actual selector for the "next page" button
			try {
				await page.click("next_page_selector");
			} catch (error) {
				console.log("No more pages or the website is unresponsive.");
				break;
			}
			counter += 1;
		}

		console.log(`Script completed. Total applications sent: ${counter}`);
	} catch (error) {
		console.error("An error occurred in the main script:", error);
	} finally {
		await browser.close();
	}
})();
