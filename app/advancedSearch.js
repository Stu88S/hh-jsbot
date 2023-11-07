const ADVANCED_SEARCH_BUTTON_SELECTOR = 'a[data-qa="advanced-search"]';
const SEARCH_INPUT_SELECTOR = 'input[data-qa="vacancysearch__keywords-input"]';
const SEARCH_SUBMIT_BUTTON_SELECTOR = 'button[data-qa="advanced-search-submit-button"]';

async function advancedSearch(page, jobSearchQuery, region) {
	try {
		// Click on the advanced search button
		await page.waitForSelector(ADVANCED_SEARCH_BUTTON_SELECTOR);
		await page.click(ADVANCED_SEARCH_BUTTON_SELECTOR);

		// Wait for the advanced search input box to be clickable and enter the search query
		await page.waitForSelector(SEARCH_INPUT_SELECTOR);
		await page.type(SEARCH_INPUT_SELECTOR, jobSearchQuery);

		// If region needs to be cleared, call the clearRegion function
		if (region === "global") {
			await clearRegion(page); // Make sure clearRegion is defined or imported
		}

		// Optional: Select all countries if required
		// if (selectAllCountriesNeeded) {
		//   await selectAllCountries(page); // Make sure selectAllCountries is defined or imported
		// }

		// Click the button to submit the search
		await page.waitForSelector(SEARCH_SUBMIT_BUTTON_SELECTOR);
		await page.click(SEARCH_SUBMIT_BUTTON_SELECTOR);
	} catch (error) {
		console.error("An error occurred during the advanced search:", error);
		throw error; // Rethrow the error if you want to handle it further up the call stack
	}
}

module.exports = { advancedSearch };
