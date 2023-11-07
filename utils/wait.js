// utils/wait.js
async function waitForFixedTime(duration) {
	return new Promise(resolve => setTimeout(resolve, duration));
}

module.exports = {
	waitForFixedTime,
};

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

// // Custom wait function using puppeteer
// async function customWait(page, selector, timeout = 1000) {
// 	await page.waitForSelector(selector, { timeout });
// }

module.exports = {
	eternalWait,
	customWait,
};
