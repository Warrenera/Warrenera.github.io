const categorySize = 4;

async function getData() {	
	const url = 'https://warrenera.github.io/cannections.json';
	const request = new Request(url);
	const response = await fetch(request);
	return await response.json();
}

function getNumbers(length) {
	// Generates unique random numbers
	const numbers = new Set();
	while(numbers.size !== categorySize) {
		numbers.add(Math.floor(Math.random() * length));
	}
	return numbers;
}

function getCategories(data, numbers) {
	const categories = [];
	for (const i of numbers) {
		categories.push(data[i]);
	}
	return categories;
}

async function main() {	
	const data = await getData();
	const numbers = getNumbers(data.length);
	const categories = getCategories(data, numbers);
	
	let selectedCount = 0;
	
	let i = 0;
	let j = 0;
	document.querySelectorAll('.square').forEach(button => {
		// TODO: randomize these so they're not all same category in a row
		// Reuse and refactor getNumbers() perhaps?
		button.textContent = categories[i]['topics'][j];
		j++;
		if (j == 4) {
			i++;
			j = 0;
		}
		
		let selected = false;
		const classes = button.classList;
		
		button.addEventListener('click', () => {
			if (selected) {
				selected = false;
				selectedCount--;
				classes.toggle('selected');
			} else if (selectedCount < 4) {
				selected = true;
				selectedCount++;
				classes.toggle('selected');
			}
		});
	});

}

main();
