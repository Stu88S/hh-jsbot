const fs = require("fs").promises;
const path = require("path");

async function loadJSON(filePath) {
	try {
		const data = await fs.readFile(filePath, "utf8");
		return JSON.parse(data);
	} catch (error) {
		console.error(`Failed to load JSON from ${filePath}:`, error);
		throw error;
	}
}

async function saveJSON(data, filePath) {
	try {
		const dir = path.dirname(filePath);
		await fs.mkdir(dir, { recursive: true });
		await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
	} catch (error) {
		console.error(`Failed to save JSON to ${filePath}:`, error);
		throw error;
	}
}

async function readTextFile(relativePath, fileName) {
	try {
		const filePath = path.join(relativePath, fileName);
		return await fs.readFile(filePath, "utf-8");
	} catch (error) {
		console.error(`Failed to read text file ${fileName} at ${relativePath}:`, error);
		throw error;
	}
}

async function deleteFolder(folderPath) {
	try {
		const files = await fs.readdir(folderPath);
		for (const file of files) {
			const curPath = path.join(folderPath, file);
			const stat = await fs.stat(curPath);
			if (stat.isDirectory()) {
				await deleteFolder(curPath);
			} else {
				await fs.unlink(curPath);
			}
		}
		await fs.rmdir(folderPath);
	} catch (error) {
		console.error(`Failed to delete folder ${folderPath}:`, error);
		throw error;
	}
}

module.exports = {
	loadJSON,
	saveJSON,
	readTextFile,
	deleteFolder,
};
