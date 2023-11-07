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
		if (isVisible) {
			await page.evaluate(element => element.click(), element);
		}
	} else {
		console.error("Element is not visible or not enabled for clicking.");
	}
}

async function selectAllCountries(page) {
	const regionSelectButton = await page.waitForSelector('[data-qa="advanced-search-region-selectFromList"]');
	await page.evaluate(button => button.click(), regionSelectButton);
	// Add additional logic to handle the selection of all countries if necessary
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

async function clearRegion(page) {
	try {
		const clearRegionButtons = await page.$x('//button[@data-qa="bloko-tag__cross"]');
		for (let button of clearRegionButtons) {
			await page.evaluate(btn => btn.click(), button);
		}
	} catch (error) {
		// Exit the function if there's an error or no buttons
		console.error("Failed to clear region:", error);
	}
}

module.exports = {
	clickAndWait,
	jsClick,
	selectAllCountries,
	scrollToBottom,
};
