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

function deselectAll(selections, submitButton) {
	selections.forEach(selection => {
		const square = document.querySelector('#' + selection.id);
		square.classList.remove('selected');
	});
	submitButton.disabled = true;
	return [0, []];
}

function rightGuess(matches) {

}

//Gotta figure out how to compare these two. Hoping can get guesses to just be text, not ID. May be easier?
function wrongGuess(oneAway, selections) {
	let selectionTexts = [];
	for (const selection of selections) {
		selectionTexts.push(selection.text);
	}
	const guessedPrior = priorGuesses.some(priorGuess => {
		return priorGuess.every(guess => selectionTexts.includes(guess));
	});
	let popup;
	if (guessedPrior) {
		popup = 'Already guessed!';
	} else {
		tries--;
		const tigers = document.querySelector('#tigers');
		// Needs to be -2. Think 🐯 has two Unicode points
		tigers.textContent = tigers.textContent.slice(0, -2);
		if (tries <= 0) {
			popup = 'Next time';
		} else {
			popup = (oneAway) ? 'One away!' : 'Not quite';
			priorGuesses.push(selectionTexts);
		}
	}
	// Change later
	alert(popup);
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
	});
	
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
		squares.forEach(button => {
			[i, j] = addText(button, shuffledCategories, i, j);
		});
	});
	
	const submitButton = document.querySelector('#submit');
	submitButton.addEventListener('click', () => {
		let oneAway = false;
		// If some selection matches every topic in some category
		const match = categories.some(category => {
			let selectionMatches = 0;
			const topicsMatch = category.topics.every(topic => {
				const textsMatch = selections.some(selection => {
					return selection.text == topic;
				});
				if (textsMatch) {
					selectionMatches++;
				}
				return textsMatch;
			});
			// If a category was already one off, don't overwrite it
			if (!oneAway) {
				oneAway = (selectionMatches === 3) ? true : false;
			}
			return topicsMatch;
		});
		(match) ? rightGuess() : wrongGuess(oneAway, selections);
	});
	/* Needed for Firefox. Otherwise, it keeps button state on page
	   refresh: https://bugzilla.mozilla.org/show_bug.cgi?id=685657 */
	submitButton.disabled = true;
}

main();
