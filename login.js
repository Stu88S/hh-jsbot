const { eternalWait } = require("../utils/wait"); // assuming eternalWait is moved to wait utilities

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

module.exports = {
	login,
	checkCookiesAndLogin,
};
