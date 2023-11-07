async function waitForFixedTime(duration) {
	return new Promise(resolve => setTimeout(resolve, duration));
}

async function eternalWait(page, selector) {
	try {
		while ((await page.$(selector)) === null) {
			console.log(`Waiting for the element(s) ${selector} to become visible...`);
			await waitForFixedTime(500);
		}
		return await page.$(selector);
	} catch (error) {
		console.error(`Error waiting for element(s) ${selector}:`, error);
		throw error;
	}
}

// Uncomment the following code if you need to use customWait
// async function customWait(page, selector, timeout = 1000) {
//   await page.waitForSelector(selector, { timeout });
// }

module.exports = {
	waitForFixedTime,
	eternalWait,
	// customWait, // Uncomment this line if you uncomment the function above
};
