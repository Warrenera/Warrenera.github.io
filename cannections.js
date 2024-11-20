async function getData() {	
	const url = 'https://warrenera.github.io/cannections.json';
	const request = new Request(url);
	const response = await fetch(request);
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
		const column = [];
		for (const row in rows) {
			column.push(rows[row][col]);
		}
		newColumn = shuffleArray(column);
		shuffledCategories.push(newColumn);
	}
	// Transposes rows of new 2D array back to columns
	return shuffledCategories[0].map((_, colIndex) => shuffledCategories.map(row => row[colIndex]));
}

function addText(button, shuffledCategories, i, j) {
	button.textContent = shuffledCategories[i][j];
	j++;
	if (j == 4) {
		i++;
		j = 0;
	}
	return [i, j];
}

function deselectAll(selectedSquares) {
	selectedSquares.forEach(squareID => {
		const square = document.querySelector('#' + squareID);
		square.classList.remove('selected');
	});
	return [0, []];
}

async function main() {	
	const data = await getData();
	const categories = shuffleArray(data).slice(0, 4);
	let shuffledCategories = shuffle(categories);
	
	let selectedSquares = [];
	let selectedCount = 0;
	let i = 0;
	let j = 0;
	
	const squares = document.querySelectorAll('.square');
	squares.forEach(button => {
		[i, j] = addText(button, shuffledCategories, i, j);
		
		const classes = button.classList;
		button.addEventListener('click', () => {
			id = button.id;
			if (selectedSquares.includes(id)) {
				const index = selectedSquares.indexOf(id);
				selectedSquares.splice(index, 1);
				selectedCount--;
				classes.toggle('selected');
			} else if (selectedCount < 4) {
				selectedSquares.push(id);
				selectedCount++;
				classes.toggle('selected');
			}
			console.log('selectedCount: ' + selectedCount);
			console.log('Selected Squares: ' + selectedSquares);
		});
	});
	
	const deselectButton = document.querySelector('#deselect');
	deselectButton.addEventListener('click', () => {
		[selectedCount, selectedSquares] = deselectAll(selectedSquares);
	});
}

main();
