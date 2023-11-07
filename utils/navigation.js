const COOKIES_PATH = "./path/to/cookies.json"; // Replace with actual path
const LOCAL_STORAGE_PATH = "./path/to/local_storage.json"; // Replace with actual path

async function navigateAndCheck(page, probePage) {
	try {
		await page.goto(probePage);
		// Replace with the correct use of customWait or page.waitForSelector
		await customWait(page, 'a[data-qa="mainmenu_myResumes"]');
		await saveJSON(await page.cookies(), COOKIES_PATH);
		const localStorageData = await page.evaluate(() => {
			let items = {};
			for (let i = 0; i < localStorage.length; i++) {
				const key = localStorage.key(i);
				items[key] = localStorage.getItem(key);
			}
			return items;
		});
		await saveJSON(localStorageData, LOCAL_STORAGE_PATH);
		return true;
	} catch (error) {
		console.error("Navigate and check failed:", error);
		return false;
	}
}

async function clickAndWait(page, selector, delay = 1000) {
	const element = await page.$(selector);
	if (element) {
		await Promise.all([element.click(), page.waitForTimeout(delay)]);
	} else {
		throw new Error(`Selector ${selector} not found`);
	}
}

async function jsClick(page, selector) {
	const element = await page.$(selector);
	if (element) {
		const isVisible = await page.evaluate(el => {
			const rect = el.getBoundingClientRect();
			return rect.top >= 0 && rect.bottom <= window.innerHeight;
		}, element);
		if (isVisible) {
			await page.evaluate(el => el.click(), element);
		} else {
			throw new Error(`Element with selector ${selector} is not visible`);
		}
	} else {
		throw new Error(`Element with selector ${selector} not found`);
	}
}

async function selectAllCountries(page) {
	const regionSelectButton = await page.waitForSelector('[data-qa="advanced-search-region-selectFromList"]');
	await page.evaluate(btn => btn.click(), regionSelectButton);
	// Add additional logic to handle the selection of all countries if necessary
}

async function scrollToBottom(page) {
	let lastHeight = await page.evaluate(() => document.body.scrollHeight);
	let newHeight;
	do {
		await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
		await page.waitForTimeout(2000);
		newHeight = await page.evaluate(() => document.body.scrollHeight);
	} while (newHeight > lastHeight && (lastHeight = newHeight));
}

async function clearRegion(page) {
	try {
		const clearRegionButtons = await page.$x('//button[@data-qa="bloko-tag__cross"]');
		for (let button of clearRegionButtons) {
			await page.evaluate(btn => btn.click(), button);
		}
	} catch (error) {
		console.error("Failed to clear region:", error);
		throw error;
	}
}

module.exports = {
	navigateAndCheck,
	clickAndWait,
	jsClick,
	selectAllCountries,
	scrollToBottom,
	clearRegion,
};
