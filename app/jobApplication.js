async function clickAllJobs() {
	const browser = await puppeteer.launch({ headless: false });
	const page = await browser.newPage();

	await page.goto("URL_OF_JOB_LISTINGS_PAGE"); // Replace with the actual URL

	await page.evaluate(_ => {
		window.scrollBy(0, window.innerHeight);
	});

	// Wait for job links to be present
	const jobLinks = await page.$$('[data-qa="vacancy-serp__vacancy-title"]'); // Replace with actual selector

	for (let link of jobLinks) {
		const href = aawait(await link.getProperty("href")).jsonValue();
		const newPage = await browser.newPage();
		await newPage.goto(href);

		// Handle potential international popup
		try {
			await newPage.waitForSelector("SELECTOR_FOR_POPUP", { timeout: 5000 }); // Replace with actual selector for the popup
			await newPage.click("SELECTOR_FOR_POPUP_BUTTON"); // Replace with the selector for the popup button to close it
		} catch (error) {
			console.log("No international popup found.");
		}

		// Customize a message based on the job title and company name
		// Assume jobTitle and companyName are available from the page
		const jobTitle = await newPage.evaluate(() => document.querySelector("JOB_TITLE_SELECTOR").textContent); // Replace with actual selector
		const companyName = await newPage.evaluate(() => document.querySelector("COMPANY_NAME_SELECTOR").textContent); // Replace with actual selector
		const message = `Your custom message using ${jobTitle} and ${companyName}`;

		// Fill in the cover letter
		await newPage.type("SELECTOR_FOR_COVER_LETTER_TEXTAREA", message); // Replace with the selector for the cover letter text area

		// Answer questions if any
		const questions = await newPage.$$("SELECTOR_FOR_QUESTIONS"); // Replace with actual selector for questions
		for (let question of questions) {
			const questionText = await (await question.getProperty("textContent")).jsonValue();
			// Logic to determine the answer based on questionText
			const answer = "Your answer here"; // This should be determined by some logic
			const answerInput = await question.$("SELECTOR_FOR_ANSWER_INPUT"); // Replace with selector for the answer input
			await answerInput.type(answer);
		}

		// Navigate back to the main list of jobs
		await page.goto("URL_OF_JOB_LISTINGS_PAGE"); // Replace with the actual URL

		await newPage.close(); // Close the tab after handling the job application
	}

	await browser.close();
}

async function answerQuestions(page, ANSWER) {
	let counter = 0;

	// Radio-buttons and Checkboxes bypass
	try {
		const ulContainers = await page.$$('//div[@data-qa="task-body"]/ul');
		for (const ul of ulContainers) {
			const inputElements = await ul.$$('./input[@type="radio" or @type="checkbox"]');
			if (inputElements.length > 0) {
				const lastInputElement = inputElements[inputElements.length - 1];
				await page.evaluate(element => element.click(), lastInputElement);
			}
		}
	} catch (error) {
		// Handle any exceptions here, for now we simply continue
	}

	// Fill in all text areas with the portfolio links from the links-list.txt file
	try {
		const testQuestionsPresence = await page.waitForSelector('//div[@data-qa="task-body"]//textarea', { timeout: 5000 });
		if (testQuestionsPresence) {
			try {
				const questions = await page.$$('//div[@data-qa="task-body"]//textarea');
				for (const question of questions) {
					await setValueWithEvent(page, question, ANSWER);
				}

				const submitButton = await page.waitForSelector('[data-qa="vacancy-response-submit-popup"]');
				await page.evaluate(button => button.removeAttribute("disabled"), submitButton);
				await page.evaluate(button => button.click(), submitButton);

				await page.waitForTimeout(3000); // sleep for 3 seconds

				try {
					const error = await page.waitForSelector(".bloko-translate-guard", { timeout: 5000 });
					if (error) {
						// Resume submitted but there was a server error. Just try this specific job the next time!
						return "SUCCESS";
					}
				} catch (error) {
					// No error element found, continue
				}

				// Wait until submitted to the server
				await page.waitForSelector(".vacancy-actions_responded");
				counter++;
				return "SUCCESS";
			} catch (error) {
				return "FAILURE";
			}
		}
	} catch (error) {
		return "FAILURE";
	}
}

async function checkCoverLetterPopup(page, message) {
	let counter = 0;
	try {
		const coverLetterPopup = await page.waitForSelector('[data-qa="vacancy-response-popup-form-letter-input"]');
		await page.type(coverLetterPopup, message);

		// Clicking the submit button, assuming the unresponsive button issue is resolved
		const popupCoverLetterSubmitButton = await page.waitForSelector('[data-qa="vacancy-response-submit-popup"]');
		await page.evaluate(button => button.click(), popupCoverLetterSubmitButton);

		await page.waitFor(3000); // sleep for 3 seconds

		try {
			const error = await page.waitForSelector(".bloko-translate-guard", { timeout: 5000 });
			if (error) {
				// Resume submitted but there was a server error. Just try this specific job the next time!
				return "SUCCESS";
			}
		} catch (error) {
			// No error element found, continue
		}

		// Wait until submitted to the server
		await page.waitForSelector(".vacancy-actions_responded");
		counter++;
		return "SUCCESS";
	} catch (error) {
		return "FAILURE";
	}
}

async function inrternationalOk(page) {
	try {
		const international = await page.waitForSelector('[data-qa="relocation-warning-confirm"]', { timeout: 5000 });
		await page.evaluate(button => button.click(), international);
	} catch (error) {
		// exit the function if the element is not found
		return;
	}
	await page.reload();
}

async function setValueWithEvent(page, selector, value) {
	await page.focus(selector);
	await page.evaluate(() => (document.querySelector(selector).value = ""));
	await page.evaluate(
		(selector, value) => {
			const element = document.querySelector(selector);
			const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value").set;
			nativeInputValueSetter.call(element, value);

			const event = new Event("input", { bubbles: true });
			element.dispatchEvent(event);
		},
		selector,
		value
	);
}
