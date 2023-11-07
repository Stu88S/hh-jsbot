async function advancedSearch(page, jobSearchQuery) {
	// Click on the advanced search button
	await page.waitForSelector('a[data-qa="advanced-search"]');
	await page.click('a[data-qa="advanced-search"]');

	// Wait for the advanced search input box to be clickable and enter the search query
	await page.waitForSelector('input[data-qa="vacancysearch__keywords-input"]');
	await page.type('input[data-qa="vacancysearch__keywords-input"]', jobSearchQuery);

	// If region needs to be cleared, call the clearRegion function
	if (region === "global") {
		await clearRegion(page);
	}

	// If needed, select all countries (this step might be skipped if all countries are selected by default)
	// Uncomment the following lines if you need to select all countries
	// await selectAllCountries(page);

	// Click the button to submit the search
	await page.waitForSelector('button[data-qa="advanced-search-submit-button"]');
	await page.click('button[data-qa="advanced-search-submit-button"]');
}
