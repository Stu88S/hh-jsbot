const fsPromises = require("fs").promises;
const { loadJSON, deleteFolder } = require("../utils/files");
const { customWait, eternalWait } = require("../utils/wait");
const { navigateAndCheck } = require("../utils/navigation");

const LOGIN_PAGE = "http://example.com/login"; // Replace with the actual login page URL
const COOKIES_PATH = "./cookies.json"; // Replace with the actual cookies path
const LOCAL_STORAGE_PATH = "./local_storage.json"; // Replace with the actual local storage path
const SEARCH_LINK = "http://example.com/search"; // Replace with the actual search page URL

// Define your selectors here
const SHOW_MORE_BUTTON_SELECTOR = 'button[data-qa="expand-login-by-password"]';
const LOGIN_FIELD_SELECTOR = `input[data-qa="login-input-username"]`;
const PASSWORD_FIELD_SELECTOR = 'input[type="password"]';
const LOGIN_BUTTON_SELECTOR = "button[data-qa='account-login-submit']";

async function login(page, username, password) {
	try {
		await page.goto(LOGIN_PAGE);
		await customWait(page, SHOW_MORE_BUTTON_SELECTOR);
		await page.click(SHOW_MORE_BUTTON_SELECTOR);
		await customWait(page, LOGIN_FIELD_SELECTOR);
		await page.type(LOGIN_FIELD_SELECTOR, username);
		await customWait(page, PASSWORD_FIELD_SELECTOR);
		await page.type(PASSWORD_FIELD_SELECTOR, password);
		await customWait(page, LOGIN_BUTTON_SELECTOR);
		await page.click(LOGIN_BUTTON_SELECTOR);
	} catch (error) {
		console.error("Login failed:", error);
		throw error;
	}
}

async function checkCookiesAndLogin(page) {
	try {
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
	} catch (error) {
		console.error("Error in checking cookies and login:", error);
		throw error;
	}
}

// Additional functions like addCookies and addLocalStorage should be defined or imported if they are used here.

module.exports = {
	login,
	checkCookiesAndLogin,
};
