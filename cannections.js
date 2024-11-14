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
		numbers.add(Math.floor(Math.random() * length) + 1);
	}
	return numbers;
}

function getCategories(categories, numbers) {
	for (let i = 0; i < categorySize; i++) {
		for (const n of numbers) {
			chosenCategories[i] = categories[n];			
		}
	}
}

async function main() {	
	const data = await getData();
	console.log(data);
	const numbers = getNumbers(data.length);
	const categories = getCategories(data, numbers);
	console.log(categories);
	
	let selectedCount = 0;
	
	document.querySelectorAll('.square').forEach((button, i) => {
		button.textContent = categories[0]['topics'][0];
		
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
			console.log('Buttons selected: ' + selectedCount);
		});
	});

}

main();
