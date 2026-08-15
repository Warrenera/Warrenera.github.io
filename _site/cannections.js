async function getData() {	
	const response = await fetch('https://warrenera.github.io/topics.json');
	return await response.json();
}

function shuffleArray(array) {
	// Implementation of the Fisher–Yates shuffle
	for (let i = array.length - 1; i >= 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}
	return array;
}

async function setCategories() {
	categories = shuffleArray(await getData()).slice(0, 4);
	/* Colors assigned dynamically/randomly. No
   correlation to difficulty unlike the real game */
	for (let i = 0; i < categories.length; i++) {
		categories[i].color = colors[i];
	}
	return categories;
}

function shuffle(categories) {
	// Grabs each column of 2D array and shuffles it
	const columns = Array.from({length: 4}, (_, i) =>
		shuffleArray(categories.map(category => category.topics[i]))
	);
	// Transposes columns back to columns and shuffles rows
	const rows = columns[0].map((_, i) => 
		shuffleArray(columns.map(column => column[i]))
	);
	return rows.flat();
}

function buttonLogic(button, unselectedTopics, state) {
	const classes = button.classList;
	const idsMatch = state.selections.some(selection => selection.id == button.id);
	if (idsMatch) {
		// Remove selection from state.selections since it's been clicked again
		const index = state.selections.findIndex(selection => selection.id == button.id);
		state.selections.splice(index, 1);
		state.selectCount--;
		classes.remove('selected');
		state.unselectedTopics.push(button.textContent);
	} else if (state.selectCount < 4) {
		// Add selection to state.selections if there aren't four already
		state.selections.push({id: button.id, text: button.textContent});
		state.selectCount++;
		classes.add('selected');
		const index = state.unselectedTopics.indexOf(button.textContent);
		state.unselectedTopics.splice(index, 1);
	}
}

function addText(buttons, unselectedTopics) {
	let i = 0;
	for (const button of buttons) {
		if (button.style.visibility === 'hidden') {
			continue;
		} else {
			button.textContent = unselectedTopics[i];
			i++;
		}
	}
}

function deselectAll(deselectButton, submitButton, state, postSubmit = false) {
	for (const selection of state.selections) {
		if (!postSubmit) {
			state.unselectedTopics.push(selection.text);				
		}
		const square = document.querySelector('#' + selection.id);
		try {
			square.classList.remove('selected');			
		}
		catch(TypeError) {
			console.warn('Could not remove "selected" class style from selection.');
		}
	}
	state.selections = [];
	state.selectCount = 0;
	deselectButton.disabled = true;
	submitButton.disabled = true;
}

function showCategory(category, state) {
	state.categoriesShown++;
	const id = 'row_' + state.categoriesShown;
	const row = document.querySelector('#' + id);
	try {		
		for (const button of row.children) {		
			button.style.visibility = 'hidden';
		}
		row.classList.toggle('row');
		row.style.background = category.color.hex;
		const topics = category.topics.join(', ');
		row.innerHTML = `<div><strong>${category.title}</strong><br>${topics}</div>`;
	}
	catch(TypeError) {
		console.warn('TypeError received while revealing categories.');
	}
}

function displayPopup(message) {
	function fade(classes) {
		classes.toggle('fade');
	}
	const popup = document.querySelector('#popup');
	popup.textContent = '  ' + message;
	const classes = popup.classList;
	fade(classes);
	setTimeout(fade, 2000, classes);
}

function determineMatch(selectionTexts, state) {
	let oneAway = false;
	let match = null;
	let resultRow = '';

	for (const category of state.categories) {
		let matchCount = category.topics.filter(
			topic => selectionTexts.includes(topic)
		).length;
		if (matchCount > 0) resultRow += category.color.emoji;
		if (matchCount === 4) match = category;
		// If some category was already one off, don't overwrite it
		if (!oneAway) oneAway = (matchCount === 3);
	}
	state.results += '\n' + resultRow;
	return {match, oneAway};
}

function endTurn(match, oneAway, buttons, selectionTexts, state) {
	if (match !== null) {
		rightGuess(match, buttons, state);
		// Removes match from state.categories so shuffle works
		const index = state.categories.findIndex(category => category.title === match.title);
		state.categories.splice(index, 1);
		if (state.categoriesShown >= 4) {
			endGame(state, 'You win! You know so much about us :)');
		} else {
			deselectAll(deselectButton, submitButton, state, true);
		}
	} else {
		wrongGuess(oneAway, selectionTexts, state);
		if (state.tries <= 0) {
			endGame(state, 'Game over 😔 but hopefully you had fun anyway!');
		}
	}
}

function rightGuess(match, buttons, state) {
	showCategory(match, state);
	addText(buttons, state.unselectedTopics);
	if (state.categoriesShown === 4) {
		const message = (state.tries === 4) ? 'Perfect!' : 'You did it!';
		displayPopup(message);
	}
}

function wrongGuess(oneAway, selectionTexts, state) {
	const guessedPrior = state.priorGuesses.some(priorGuess => {
		return priorGuess.every(guess => selectionTexts.includes(guess));
	});
	let message;
	if (guessedPrior) {
		message = 'Already guessed!';
	} else {
		state.tries--;
		const tigers = document.querySelector('#tigers');
		// Needs to be -2. Think 🐯 has two Unicode points
		tigers.textContent = tigers.textContent.slice(0, -2);
		if (state.tries <= 0) {
			message = 'Next time!';
		} else {
			message = (oneAway) ? 'One away!' : 'Not quite';
			state.priorGuesses.push(selectionTexts);
		}
	}
	displayPopup(message);
}

function endGame(state, endMessage) {
	submitButton.disabled = true;
	shuffleButton.disabled = true;
	deselectButton.disabled = true;

	const shareObject = {
		text: 'Andrew loves me so much he made a whole game about us ♥ check it out!\n' + state.results,
		title: 'cAnnections',
		url: 'https://warrenera.github.io/'
	}
	for (const category of state.categories) {
		showCategory(category, state);
	}
	const tigers = document.querySelector('#tigers');
	tigers.textContent = endMessage + ' Refresh the page to play again';
	const shareButton = document.querySelector('#share');
	shareButton.hidden = false;
	shareButton.addEventListener('click', async () => {
		try {
			await navigator.share(shareObject);
		} catch(e) {
			console.error(e);
			if (e instanceof TypeError || e instanceof DataError || e instanceof NotAllowedError) {
				const clipboardText = shareObject.text + '\n' + shareObject.url;
				navigator.clipboard.writeText(clipboardText);
				displayPopup('Copied to clipboard');					
			}
		}
	});
}


// Start of main logic
const colors = [
	{ // Yellow
		'emoji': '🟨',
		'hex': '#f9df6d'
	},
	{ // Green
		'emoji': '🟩',
		'hex': '#a0c35a'
	},
	{ // Blue
		'emoji': '🟦',
		'hex': '#b0c4ef'
	},
	{ // Purple
		'emoji': '🟪',
		'hex': '#ba81c5'
	}
]
const state = {
	selectCount: 0,
	selections: [],
	tries: 4,
	categoriesShown: 0,
	priorGuesses: [],
	results: 'cAnnections',
	categories: setCategories(),
	unselectedTopics: []
};
unselectedTopics = shuffle(state.categories);

const buttons = document.querySelectorAll('.square');
addText(buttons, state.unselectedTopics);
for (const button of buttons) {
	button.addEventListener('click', () => {
		buttonLogic(button, state);
		submitButton.disabled = (state.selectCount === 4);
		deselectButton.disabled = (state.selectCount === 0);
	});
}

const deselectButton = document.querySelector('#deselect');
deselectButton.addEventListener('click', () => {
	deselectAll(deselectButton, submitButton, state);
});

const shuffleButton = document.querySelector('#shuffle');
shuffleButton.addEventListener('click', () => {
	deselectAll(deselectButton, submitButton, state);
	state.unselectedTopics = shuffle(state.categories);
	addText(buttons, state.unselectedTopics);
});
	
const submitButton = document.querySelector('#submit');
submitButton.addEventListener('click', () => {
	const selectionTexts = state.selections.map(selection => selection.text);
	const {match, oneAway} = determineMatch(selectionTexts, state);
	endTurn(match, oneAway, buttons, selectionTexts, state);
});

/* Needed for Firefox. Otherwise, it keeps button state on page
   refresh: https://bugzilla.mozilla.org/show_bug.cgi?id=685657 */
submitButton.disabled = true;
