const fs = require("fs").promises;

const readFileAsync = util.promisify(fs.readFile);
const writeFileAsync = util.promisify(fs.writeFile);
const mkdirAsync = util.promisify(fs.mkdir);
const readdirAsync = util.promisify(fs.readdir);
const rmdirAsync = util.promisify(fs.rmdir);
const unlinkAsync = util.promisify(fs.unlink);

async function loadJSON(path) {
	const data = await fs.readFile(path, "utf8");
	return JSON.parse(data);
}

async function saveJSON(data, path) {
	const dir = path.substring(0, path.lastIndexOf("/"));
	await fs.mkdir(dir, { recursive: true });
	await fs.writeFile(path, JSON.stringify(data, null, 2));
}

async function readTextFile(relativePath, fileName) {
	const filePath = `${relativePath}/${fileName}`;
	return await fs.readFile(filePath, { encoding: "utf-8" });
}

async function deleteFolder(folderPath) {
	const files = await fs.readdir(folderPath);
	for (const file of files) {
		const curPath = `${folderPath}/${file}`;
		if ((await fs.stat(curPath)).isDirectory()) {
			await deleteFolder(curPath);
		} else {
			await fs.unlink(curPath);
		}
	}
	await fs.rmdir(folderPath);
}

module.exports = {
	loadJSON,
	saveJSON,
	readTextFile,
	deleteFolder,
};
