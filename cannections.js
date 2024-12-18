(async () => {
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

	function shuffle(categories) {
		// Get array of topic arrays
		const rows = [];
		for (const category of categories) {
			rows.push(category.topics);
		}

		// Shuffle columns
		let columns = [];
		/* 4 is number of categories to start. Can't use `col in rows` because it
		   will break if category already found, removed from categories var */
		for (let i = 0; i < 4; i++) {
			const column = [];
			for (const row in rows) {
				column.push(rows[row][i]);
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
		// Return values in list since that's all we need
		const topics = [];
		for (array of shuffledArray) {
			for (element of array) {
				topics.push(element);
			}
		}
		return topics;
	}
	
	function buttonLogic(button, selections, unselectedTopics) {
		const classes = button.classList;
		const idsMatch = selections.some(selection => selection.id == button.id);
		if (idsMatch) {
			// Remove selection from selections since it's been clicked again
			const index = selections.findIndex(selection => selection.id == button.id);
			selections.splice(index, 1);
			selectCount--;
			classes.remove('selected');
			unselectedTopics.push(button.textContent);
		} else if (selectCount < 4) {
			// Add selection to selections if there aren't four already
			selections.push({id: button.id, text: button.textContent});
			selectCount++;
			classes.add('selected');
			const index = unselectedTopics.indexOf(button.textContent);
			unselectedTopics.splice(index, 1);
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

	function deselectAll(deselectButton, submitButton, postSubmit = false) {
		for (const selection of selections) {
			if (!postSubmit) {
				unselectedTopics.push(selection.text);				
			}
			const square = document.querySelector('#' + selection.id);
			try {
				square.classList.remove('selected');			
			}
			catch(TypeError) {
				continue;
			}
		}
		selections = [];
		selectCount = 0;
		deselectButton.disabled = true;
		submitButton.disabled = true;
	}

	function showCategory(category) {
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
			row.innerHTML = `<br><strong>${category.title}</strong><br>${topics}`;
		}
		catch(TypeError) {
			// No-op
			() => {}
		}
	}

	function displayPopup(message, time=2000) {
		const popup = document.querySelector('#popup');
		popup.textContent = '  ' + message;
		const classes = popup.classList;
		fade = classes => classes.toggle('fade');
		fade(classes);
		setTimeout(fade, time, classes);
	}

	function rightGuess(matchingCategory, buttons, unselectedTopics) {
		showCategory(matchingCategory);
		addText(buttons, unselectedTopics);
		if (categoriesShown === 4) {
			const message = (tries === 4) ? 'Perfect!' : 'You did it!';
			displayPopup(message);
		}
	}

	function wrongGuess(oneAway, selectionTexts, priorGuesses) {
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
				message = 'Next time';
			} else {
				message = (oneAway) ? 'One away!' : 'Not quite';
				priorGuesses.push(selectionTexts);
			}
		}
		displayPopup(message);
	}

	function endGame(finalResults, categories, endMessage) {
		const shareObject = {
			text: 'Andrew loves me so much he made a whole game about to us ♥ check it out!\n' + finalResults,
			title: 'cAnnections',
			url: 'https://warrenera.github.io/'
		}
		for (const category of categories) {
			showCategory(category);
		}
		const tigers = document.querySelector('#tigers');
		tigers.textContent = endMessage + ' Refresh the page to play again.';
		const shareButton = document.querySelector('#share');
		shareButton.hidden = false;
		shareButton.addEventListener('click', async () => {
			try {
				await navigator.share(shareObject);
			} catch(error) {
				const clipboardText = shareObject.text + '\n' + shareObject.url;
				navigator.clipboard.writeText(clipboardText);
				displayPopup('Copied to clipboard:\n' + clipboardText, 5000);
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
	let categoriesShown = 0;
	let priorGuesses = [];
	let results = 'cAnnections';
	let selectCount = 0;
	let selections = [];
	let tries = 4;
	
	let categories = shuffleArray(await getData()).slice(0, 4);
	/* Colors assigned dynamically/randomly. No
	   correlation to difficulty unlike the real game */
	for (let i = 0; i < categories.length; i++) {
		categories[i].color = colors[i];
	}
	let unselectedTopics = shuffle(categories);
	
	const buttons = document.querySelectorAll('.square');
	addText(buttons, unselectedTopics);
	for (const button of buttons) {
		button.addEventListener('click', () => {
			buttonLogic(button, selections, unselectedTopics);
			submitButton.disabled = (selectCount === 4) ? false : true;
			deselectButton.disabled = (selectCount === 0) ? true : false;
		});
	}
	
	const deselectButton = document.querySelector('#deselect');
	deselectButton.addEventListener('click', () => {
		deselectAll(deselectButton, submitButton);
	});
	
	const shuffleButton = document.querySelector('#shuffle');
	shuffleButton.addEventListener('click', () => {
		deselectAll(deselectButton, submitButton);
		unselectedTopics = shuffle(categories);
		addText(buttons, unselectedTopics);
	});
	
	const submitButton = document.querySelector('#submit');
	submitButton.addEventListener('click', () => {
		let selectionTexts = [];
		for (const selection of selections) {
			selectionTexts.push(selection.text);
		}
		let oneAway = false;
		let matchingCategory;
		let resultRow = '';
		const match = categories.some(category => {
			let matchCount = 0;
			for (const topic of category.topics) {
				if (selectionTexts.includes(topic)) {
					resultRow += category.color.emoji;
					matchCount++;
					if (matchCount === 4) {
						matchingCategory = category;
					}
				}
			}
			// If some category was already one off, don't overwrite it
			if (!oneAway) {
				oneAway = (matchCount === 3) ? true : false;
			}
			return (matchingCategory) ? true : false;
		});
		// TODO: Split function roughly here somehow? Too long
		results += '\n' + resultRow;
		// TODO: Split here again?
		if (match) {
			rightGuess(matchingCategory, buttons, unselectedTopics);
			// Removes matchingCategory from categories so shuffle works
			const index = categories.findIndex(category => category.title === matchingCategory.title);
			categories.splice(index, 1);
			if (categoriesShown >= 4) {
				submitButton.disabled = true;
				shuffleButton.disabled = true;
				deselectButton.disabled = true;
				endGame(results, categories, 'You win! You know so much about us :)');
			} else {
				deselectAll(deselectButton, submitButton, true);
			}
		} else {
			wrongGuess(oneAway, selectionTexts, priorGuesses);
			if (tries <= 0) {
				submitButton.disabled = true;
				shuffleButton.disabled = true;
				deselectButton.disabled = true;
				endGame(results, categories, 'Game over 😔 but hopefully you had fun anway!');
			}
		}
	});
	/* Needed for Firefox. Otherwise, it keeps button state on page
	   refresh: https://bugzilla.mozilla.org/show_bug.cgi?id=685657 */
	submitButton.disabled = true;
})();
