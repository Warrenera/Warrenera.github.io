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
	if (j === 4) {
		i++;
		j = 0;
	}
	return [i, j];
}

function deselectAll(selectedSquares) {
	selectedSquares.forEach(selectedSquare => {
		const square = document.querySelector('#' + selectedSquare.id);
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
	
	let selectedSquares = [];
	let selectedCount = 0;
	let i = 0;
	let j = 0;
	
	const squares = document.querySelectorAll('.square');
	squares.forEach(button => {
		[i, j] = addText(button, shuffledCategories, i, j);
		
		const classes = button.classList;
		button.addEventListener('click', () => {
			const idsMatch = selectedSquares.some(square => square.id == button.id);
			if (idsMatch) {
				const index = selectedSquares.indexOf(button.id);
				selectedSquares.splice(index, 1);
				selectedCount--;
				classes.toggle('selected');
			} else if (selectedCount < 4) {
				const newSelection = {id: button.id, text: button.textContent};
				selectedSquares.push(newSelection);
				selectedCount++;
				classes.toggle('selected');
			}
			console.log('selectedCount: ' + selectedCount);
			console.log('Selected Squares: ' + JSON.stringify(selectedSquares));
			
			(selectedCount === 4) ? submitButton.disabled = false : submitButton.disabled = true;
		});
	});
	
	const deselectButton = document.querySelector('#deselect');
	deselectButton.addEventListener('click', () => {
		[selectedCount, selectedSquares] = deselectAll(selectedSquares);
	});
	
	const shuffleButton = document.querySelector('#shuffle');
	shuffleButton.addEventListener('click', () => {
		[selectedCount, selectedSquares] = deselectAll(selectedSquares);
		shuffledCategories = shuffle(categories);
		i = 0;
		j = 0;
		squares.forEach(button => {
			[i, j] = addText(button, shuffledCategories, i, j);
		});
	});
	
	const submitButton = document.querySelector('#submit');
	submitButton.addEventListener('click', () => {
		selectedValues = [];
	});
}

main();
