/**
 * Fetch all game categories from the specified URL. 
 * @async
 * @returns a promise for a JSON object of all possible categories
 */
async function getData() {
	const response = await fetch(window.location.href + 'topics.json');
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

/**
 * Choose which categories to use for the game and set their colors.
 * @param {object} colors the color objects to assign to the categories
 * @returns an array of category objects to use in the game
 */
async function setCategories(colors) {
	const categories = shuffleArray(await getData()).slice(0, 4);
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
	// Transposes 'columns' back to actual columns and shuffles rows
	const rows = columns[0].map((_, i) => 
		shuffleArray(columns.map(column => column[i]))
	);
	return rows.flat();
}

/**
 * Determine whether to click or unclick a button.
 * @param {*} button the buton to which logic is applied
 * @param {*} selections the choices the player has made so far
 * @param {*} unselectedTopics the choices the player hasn't chosen yet
 */
function buttonLogic(button, selections, unselectedTopics) {
	const classes = button.classList;
	const idsMatch = selections.some(selection => selection.id == button.id);
	if (idsMatch) {
		// Remove selection from state.selections since it's been clicked again
		const index = selections.findIndex(selection => selection.id == button.id);
		selections.splice(index, 1);
		classes.remove('selected');
		unselectedTopics.push(button.textContent);
	} else if (selections.length < 4) {
		// Add selection to state.selections if there aren't four already
		selections.push({id: button.id, text: button.textContent});
		classes.add('selected');
		const index = state.unselectedTopics.indexOf(button.textContent);
		unselectedTopics.splice(index, 1);
	}
}

function addText(buttons, unselectedTopics) {
/**
 * Unselect all previously selected squares.
 * @param {*} deselectButton the Deselect button
 * @param {*} submitButton the Submit button
 * @param {*} selections the choices the player has made so far
 * @param {*} unselectedTopics the choices the player hasn't chosen yet
 * @param {*} postSubmit whether or not this deselection occurs after the player presses the Submit button
 */
function deselectAll(
	deselectButton,
	submitButton,
	selections,
	unselectedTopics,
	postSubmit = false,
) {
	for (const selection of selections) {
		if (!postSubmit) {
			unselectedTopics.push(selection.text);				
		}
		const square = document.querySelector('#' + selection.id);
		try {
			square.classList.remove('selected');			
		} catch(TypeError) {
			console.warn('Could not remove "selected" class style from selection.');
		}
	}
	selections = [];
	deselectButton.disabled = true;
	submitButton.disabled = true;
}

/**
 * Reveal a category, either when guessed, or when the game is lost.
 * @param {*} category the category to reveal
 * @param {*} categoriesShown categories which have already been shown
 */
function showCategory(category, categoriesShown) {
	categoriesShown++;
	const id = 'row_' + categoriesShown;
	const row = document.querySelector('#' + id);
	try {		
		for (const button of row.children) {		
			button.style.visibility = 'hidden';
		}
		row.classList.toggle('row');
		row.style.background = category.color.hex;
		const topics = category.topics.join(', ');
		row.innerHTML = `<div><strong>${category.title}</strong><br>${topics}</div>`;
	} catch(TypeError) {
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

/**
 * Determine whether or not the player has guessed correctly.
 * @param {*} selectionTexts texts the player guessed
 * @param {*} categories the game categories
 * @returns whether or not the guess matches a game category
 */
function determineMatchResult(selectionTexts, categories) {
	oneAway = false;
	match = null;
	emojiRow = '';

	for (const category of categories) {
		let matchCount = category.topics.filter(
			topic => selectionTexts.includes(topic)
		).length;
		if (matchCount > 0) emojiRow += category.color.emoji;
		if (matchCount === 4) match = category;
		// If some category was already one off, don't overwrite it
		if (!oneAway) oneAway = (matchCount === 3);
	}
	return {match, oneAway, emojiRow};
}

/**
 * End a player's turn by deciding whether or not they guessed correctly
 * @param {*} match the matching category, if the guess did match
 * @param {*} oneAway whether or not the guess was one topic away from being correct
 * @param {*} selectionTexts texts the player guessed
 * @param {*} state an object containing the game's state
 * @param {*} ui an object containing the game's interactable UI
 */
function endTurn(match, oneAway, selectionTexts, state, ui) {
	if (match !== null) {
		rightGuess(match, ui.buttons, state);
		// Removes match from state.categories so shuffle works
		const index = state.categories.findIndex(category => category.title === match.title);
		state.categories.splice(index, 1);
		if (state.categoriesShown >= 4) {
			endGame(state, ui, 'You win! You know so much about us :)');
		} else {
			deselectAll(
				deselectButton,
				submitButton,
				state.selections,
				state.unselectedTopics,
				true,
			);
		}
	} else {
		wrongGuess(oneAway, selectionTexts, state.priorGuesses, state.tries);
		if (state.tries <= 0) {
			endGame(state, ui, 'Game over 😔 but hopefully you had fun anyway!');
		}
	}
}

function rightGuess(match, buttons, state) {
	showCategory(match, state.categoriesShown);
	addText(buttons, state.unselectedTopics);
	if (state.categoriesShown === 4) {
		const message = (state.tries === 4) ? 'Perfect!' : 'You did it!';
		displayPopup(message);
	}
}

/**
 * Take action when the user incorrectly guessed a category
 * @param {*} oneAway whether or not the guess was one topic away from being correct
 * @param {*} selectionTexts texts the player guessed
 * @param {*} priorGuesses combinations the player has previously guessed
 * @param {*} tries the number of guesses the player has left
 */
function wrongGuess(oneAway, selectionTexts, priorGuesses, tries) {
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
			message = (oneAway) ? 'One away!' : 'Not quite';
			priorGuesses.push(selectionTexts);
		}
	}
	displayPopup(message);
}

/**
 * Take action to close out the game
 * @param {*} state an object containing the game's state
 * @param {*} ui an object containing the game's interactable UI
 * @param {*} endMessage the win/lose portion of the final message shown to the player
 */
function endGame(state, ui, endMessage,) {
	ui.submitButton.disabled = true;
	ui.shuffleButton.disabled = true;
	ui.deselectButton.disabled = true;

	const shareObject = {
		text: 'Andrew loves me so much he made a whole game about us ♥ check it out!\n' + state.results,
		title: 'cAnnections',
		url: 'https://warrenera.github.io/'
	}
	for (const category of state.categories) {
		showCategory(category, state.categoriesShown);
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
	categories: await setCategories(colors),
	categoriesShown: 0,
	priorGuesses: [],
	results: 'cAnnections',
	selections: [],
	tries: 4,
	unselectedTopics: [],
};
state.unselectedTopics = shuffle(state.categories);
const ui = {
	buttons: document.querySelectorAll('.square'),
    deselectButton: document.querySelector('#deselect'),
    shareButton: document.querySelector('#share'),
    shuffleButton: document.querySelector('#shuffle'),
    submitButton: document.querySelector('#submit'),
};

addText(ui.buttons, state.unselectedTopics);
for (const button of ui.buttons) {
	button.addEventListener('click', () => {
		buttonLogic(button, state.selections, state.unselectedTopics);
		ui.submitButton.disabled = (state.selections.length !== 4);
		ui.deselectButton.disabled = (state.selections.length === 0);
	});
}

ui.deselectButton.addEventListener('click', () => {
	deselectAll(ui.deselectButton, ui.submitButton, state.selections, state.unselectedTopics);
});

ui.shuffleButton.addEventListener('click', () => {
	deselectAll(ui.deselectButton, ui.submitButton, state.selections, state.unselectedTopics);
	state.unselectedTopics = shuffle(state.categories);
	addText(ui.buttons, state.unselectedTopics);
});
	
ui.submitButton.addEventListener('click', () => {
	const selectionTexts = state.selections.map(selection => selection.text);
	const result = determineMatchResult(selectionTexts, state.categories);
	state.results += '\n' + result.emojiRow;
	endTurn(result.match, result.oneAway, selectionTexts, state, ui);
});

/* Needed for Firefox. Otherwise, it keeps button state on page
   refresh: https://bugzilla.mozilla.org/show_bug.cgi?id=685657 */
ui.submitButton.disabled = true;
