let tries = 4;
let priorGuesses = [];

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
	// Get array of topic arrays
	const rows = [];
	for (const category of categories) {
		rows.push(category['topics']);
	}

	// Shuffle columns
	let columns = [];
	for (const col in rows) {
		const column = [];
		for (const row in rows) {
			column.push(rows[row][col]);
		}
		columns.push(shuffleArray(column));
	}
	
	// Transpose rows of new 2D array back to columns
	columns = columns[0].map((_, i) => columns.map(row => row[i]));
	
	// Shuffle rows of now-shuffled columns
	const shuffledArray = [];
	for (const row of columns) {
		shuffledArray.push(shuffleArray(row));
	}
	return shuffledArray;
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

function deselectAll(selections, submitButton) {
	
	for (const selection of selections) {
		const square = document.querySelector('#' + selection.id);
		square.classList.remove('selected');
	}
	submitButton.disabled = true;
	return [0, []];
}

function rightGuess(matches) {

}

function displayPopup(message) {
	const popup = document.querySelector('#popup');
	popup.textContent = message;
	const classes = popup.classList;
	fade = classes => classes.toggle('fade');
	fade(classes);
	setTimeout(fade, 2000, classes);
}

function wrongGuess(oneAway, selectionTexts) {
	const guessedPrior = priorGuesses.some(priorGuess => {
		return priorGuess.every(guess => selectionTexts.includes(guess));
	});
	let message;
	if (guessedPrior) {
		message = 'Already guessed!';
	} else {
		tries--;
		const tigers = document.querySelector('#tigers');
		// Needs to be -2. Think 🐯 has two Unicode points
		tigers.textContent = tigers.textContent.slice(0, -2);
		if (tries <= 0) {
			message = 'Next time!';
		} else {
			message = (oneAway) ? 'One away!' : 'Not quite...';
			priorGuesses.push(selectionTexts);
		}
	}
	displayPopup(message);
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
	
	const buttons = document.querySelectorAll('.square');
	for (const button of buttons) {
		[i, j] = addText(button, shuffledCategories, i, j);
		
		const classes = button.classList;
		button.addEventListener('click', () => {
			const idsMatch = selections.some(selection => selection.id == button.id);
			if (idsMatch) {
				const index = selections.findIndex(selection => selection.id == button.id);
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
	}
	
	const deselectButton = document.querySelector('#deselect');
	deselectButton.addEventListener('click', () => {
		[selectCount, selections] = deselectAll(selections, submitButton);
	});
	
	const shuffleButton = document.querySelector('#shuffle');
	shuffleButton.addEventListener('click', () => {
		[selectCount, selections] = deselectAll(selections, submitButton);
		shuffledCategories = shuffle(categories);
		i = 0;
		j = 0;
		for (const button of buttons) {
			[i, j] = addText(button, shuffledCategories, i, j);
		}
	});
	
	const submitButton = document.querySelector('#submit');
	submitButton.addEventListener('click', () => {
		let selectionTexts = [];
		for (const selection of selections) {
			selectionTexts.push(selection.text);
		}
		let oneAway = false;
		const match = categories.some(category => {
			let matchCount = 0;
			for (const topic of category.topics) {
				if (selectionTexts.includes(topic)) {
					matchCount++;
				}
			}
			// If some category was already one off, don't overwrite it
			if (!oneAway) {
				oneAway = (matchCount === 3) ? true : false;
			}
			return (matchCount === 4) ? true : false;
		});
		(match) ? rightGuess() : wrongGuess(oneAway, selectionTexts);
	});
	/* Needed for Firefox. Otherwise, it keeps button state on page
	   refresh: https://bugzilla.mozilla.org/show_bug.cgi?id=685657 */
	submitButton.disabled = true;
}

main();
