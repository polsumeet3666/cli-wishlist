let figlet = require("figlet");
console.log(figlet.textSync("Wishlist"));
let inquirer = require("inquirer");
let file = "wishlist.json";
let fs = require("fs");
let clear = require("clear");
let list = { wishlist: [], completed: [] };
let table = require("text-table");
let star = "⭐";

async function init() {
	let q = [
		{
			type: "list",
			name: "file",
			message: "Data Store",
			choices: [
				{ value: "1", name: "Create new at current location" },
				{
					value: "2",
					name: "Use existing one from different path",
				},
				{
					value: "3",
					name: "Use existing one from current path",
				},
			],
		},
	];
	let ans = await userInput(q);
	switch (ans.file) {
		case "1":
			// create new in current location
			await saveDataStore(file, list);
			break;
		case "2":
			// ask for db path
			q = [
				{
					type: "input",
					name: "filepath",
					message: "Enter complete filepath with name :",
					validate: function (value) {
						if (fs.existsSync(value)) {
							return true;
						}
						return "Invalid filepath, please enter correct file path";
					},
				},
			];
			ans = await userInput(q);
			file = ans.filepath;
			break;
		case "3":
			q = [
				{
					type: "input",
					name: "fileName",
					message: "Enter data store file name :",
					default: "wishlist.json",
				},
			];
			ans = await userInput(q);
			file = ans.fileName;
			await readListInMemory(file);

			return;
			break;
	}

	return;
}

function readListInMemory(file) {
	return new Promise((resolve, reject) => {
		let data = fs.readFileSync(file, "utf8");
		list = JSON.parse(data);

		resolve();
	});
}

function saveDataStore(file, list) {
	return new Promise((resolve, reject) => {
		fs.open(file, "w", (err, fd) => {
			if (err != null) {
				reject(err);
			}

			fs.writeFile(fd, JSON.stringify(list), "utf8", (err) => {
				if (err != null) {
					reject(err);
				}

				fs.closeSync(fd);
				resolve(true);
			});
		});
	});
}

async function userInput(questions) {
	let result = await inquirer.prompt(questions);
	//console.log(result);
	return result;
}

async function main() {
	try {
		await init();
		//clear();
		await showMenu();
	} catch (error) {
		console.log(error);
	}
}
main();
async function showMenu() {
	let choice = "";
	do {
		let menuQuestions = [
			{
				type: "list",
				name: "menu",
				message: "Select operation",
				choices: [
					{ name: "Add Item", value: "1" },
					{ name: "Show Wish List", value: "2" },
					{
						name:
							"TODO : Update item (change priority/mark completed)",
						value: "3",
					},
					{ name: "TODO : Remove item", value: "3" },
					{ name: "Exit", value: "0" },
				],
			},
		];
		let ans = await inquirer.prompt(menuQuestions);
		let choice = ans.menu;
		switch (choice) {
			case "1":
				// console.log("add item");
				await addItem();
				break;
			case "2":
				console.log("show list");
				await showWishList(list);
				// console.log(JSON.stringify(list, null, 2));
				break;
			case "0":
				console.log("Exit");
				process.exit(0);
			default:
				break;
		}
	} while (choice != "0");
}

async function showWishList(list) {
	let displayList = [["Name", "Priority"]];
	list.wishlist = list.wishlist.sort((a, b) => {
		if (a.priority > b.priority) {
			return -1;
		}
		if (a.priority < b.priority) {
			return 1;
		} else {
			return 0;
		}
	});
	list.wishlist.forEach((i) => {
		let name = i.item;
		let imp = "";
		for (let j = 0; j < Number(i.priority); j++) {
			imp += star;
		}
		displayList.push([name, imp]);
	});

	let t = table(displayList);
	console.log(t);
}

async function addItem() {
	let question = [
		{
			type: "input",
			name: "item",
			message: "Enter item name :",
		},
		{
			type: "input",
			name: "priority",
			message: "On scale of 1 to 5, what is item's priority :",
			validate: function (value) {
				if (value >= 1 && value <= 5) {
					return true;
				}
				return "Please enter priority on scale of 1 to 5";
			},
		},
	];
	let ans = await userInput(question);
	list.wishlist.push(ans);
	await saveDataStore(file, list);
}
