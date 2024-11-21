async function getData() {	
	const response = await fetch('https://warrenera.github.io/cannections.json');
	return await response.json();
}

function shuffleArray(array) {
	// Implementation of the Fisher–Yates shuffle
    for (let i = array.length -1; i >= 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
	return array;
}

function shuffle(categories) {
	rows = [];
	for (const category of categories) {
		topics = shuffleArray(category['topics'])
		rows.push(topics);
	}
	const shuffledCategories = [];
	for (const col in rows) {
		let column = [];
		for (const row in rows) {
			column.push(rows[row][col]);
		}
		column = shuffleArray(column);
		shuffledCategories.push(column);
	}
	// Transposes rows of new 2D array back to columns
	return shuffledCategories[0].map((_, colIndex) => shuffledCategories.map(row => row[colIndex]));
}

function addText(button, shuffledCategories, i, j) {
	button.textContent = shuffledCategories[i][j];
	j++;
	if (j === 4) {
		i++;
		j = 0;
	}
	return [i, j];
}

function deselectAll(selections) {
	selections.forEach(selection => {
		const square = document.querySelector('#' + selection.id);
		square.classList.remove('selected');
	});
	return [0, []];
}

async function main() {	
	// TODO: Figure out why data can't be an anonymous asynchronous function at the top level
	// Then if you can, clean up function calls needing to return values like i, j
	// and remove main()
	const data = await getData();
	const categories = shuffleArray(data).slice(0, 4);
	let shuffledCategories = shuffle(categories);
	
	let selections = [];
	let selectCount = 0;
	let i = 0;
	let j = 0;
	
	const squares = document.querySelectorAll('.square');
	squares.forEach(button => {
		[i, j] = addText(button, shuffledCategories, i, j);
		
		const classes = button.classList;
		button.addEventListener('click', () => {
			const idsMatch = selections.some(square => square.id == button.id);
			if (idsMatch) {
				const index = selections.findIndex(square => square.id == button.id);
				selections.splice(index, 1);
				selectCount--;
				classes.toggle('selected');
			} else if (selectCount < 4) {
				const newSelection = {id: button.id, text: button.textContent};
				selections.push(newSelection);
				selectCount++;
				classes.toggle('selected');
			}
			console.log('selectCount: ' + selectCount);
			console.log('Selected Squares: ' + JSON.stringify(selections));
			
			(selectCount === 4) ? submitButton.disabled = false : submitButton.disabled = true;
		});
	});
	
	const deselectButton = document.querySelector('#deselect');
	deselectButton.addEventListener('click', () => {
		[selectCount, selections] = deselectAll(selections);
	});
	
	const shuffleButton = document.querySelector('#shuffle');
	shuffleButton.addEventListener('click', () => {
		[selectCount, selections] = deselectAll(selections);
		shuffledCategories = shuffle(categories);
		i = 0;
		j = 0;
		squares.forEach(button => {
			[i, j] = addText(button, shuffledCategories, i, j);
		});
	});
	
	const submitButton = document.querySelector('#submit');
	submitButton.addEventListener('click', () => {
		//selections.forEach()
	});
}

main();
