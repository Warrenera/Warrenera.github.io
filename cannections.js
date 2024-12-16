(async () => {
	const colors = {
		row_1: '#f9df6d',
		row_2: '#a0c35a',
		row_3: '#b0c4ef',
		row_4: '#ba81c5'
	}
	let categoriesShown = 0;
	let priorGuesses = [];
	let selections = [];
	let selectCount = 0;
	let tries = 4;

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
		// Return values in list since that's all we need
		const topics = [];
		for (array of shuffledArray) {
			for (element of array) {
				topics.push(element);
			}
		}
		return topics;
	}
	
	function buttonLogic(button, deselectButton) {
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
		console.log('Selected Squares: ' + JSON.stringify(selections));
		console.log('Unselected Squares: ' + JSON.stringify(unselectedTopics));

		submitButton.disabled = (selectCount === 4) ? false : true;
		deselectButton.disabled = (selectCount === 0) ? true : false;
	}

	function addText() {
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

	function deselectAll(submitButton, postSubmit = false) {
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
			row.style.background = colors[id];
			const topics = category.topics.join(', ');
			row.innerHTML = `<br><strong>${category.title}</strong><br>${topics}`;
		}
		catch(TypeError) {
			// No-op
			() => {}
		}
	}

	function displayPopup(message) {
		const popup = document.querySelector('#popup');
		popup.textContent = '  ' + message + '  ';
		const classes = popup.classList;
		fade = classes => classes.toggle('fade');
		fade(classes);
		setTimeout(fade, 2000, classes);
	}

	function rightGuess(matchingCategory) {
		showCategory(matchingCategory);
		addText();
		/*let j = 0;
		for (let i = categoriesShown + 1; i < 5; i++) {
			const id = 'row_' + i;
			const row = document.querySelector('#' + id);
			for (const button of row.children) {
				button.textContent = unselectedTopics[j];
				j++;
			}		
		}*/
		let message;
		if (categoriesShown === 4) {
			if (tries === 4) {
				message = 'Perfect!';
			} else {			
				message = 'You did it!';
			}
			displayPopup(message);
		}
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
				message = 'Next time';
			} else {
				message = (oneAway) ? 'One away!' : 'Not quite';
				priorGuesses.push(selectionTexts);
			}
		}
		displayPopup(message);
	}

	function gameOver(categories, endMessage) {
		for (const category of categories) {
			showCategory(category);
		}
		const tigers = document.querySelector('#tigers');
		tigers.textContent = endMessage;
		/*TODO: Will need to track state across guesses. New array?
		const shareButton = document.querySelector('#share');
		shareButton.hidden = false;
		shareButton.addEventListener('click', async () => {
			try {
				await navigator.share({
					text: 'test',
					title: 'cAnnections',
					url: 'https://warrenera.github.io/cannections.html'
				});
			} catch (err) {
				console.error(err);
			}
		});*/
	}
	
	// Start of main logic

	let categories = shuffleArray(await getData()).slice(0, 4);
	let unselectedTopics = shuffle(categories);
	
	const buttons = document.querySelectorAll('.square');
	addText();
	for (const button of buttons) {
		button.addEventListener('click', () => {
			buttonLogic(button, deselectButton);
		});
	}
	
	const deselectButton = document.querySelector('#deselect');
	deselectButton.disabled = true;
	deselectButton.addEventListener('click', () => {
		deselectAll(submitButton);
	});
	
	// Shuffle currently BROKEN
	// if shuffled after category is revealed, will shuffle revealed category topics too
	// Because shuffle(categories) doesn't take revealed ones into account
	// Need to keep track of them somewhere. Another "global" array?
	
	//2024-12-14 UPDATE: still broken. Tried to fix by removing right category from categories after finding it. Think it broke it more lol
	
	//2024-12-15 UPDATE: No changes from above, but on playing noticed categories randomly don't work. Def broke it more
	const shuffleButton = document.querySelector('#shuffle');
	shuffleButton.addEventListener('click', () => {
		deselectAll(submitButton);
		unselectedTopics = shuffle(categories);
		addText();
	});
	
	const submitButton = document.querySelector('#submit');
	submitButton.addEventListener('click', () => {
		let selectionTexts = [];
		for (const selection of selections) {
			selectionTexts.push(selection.text);
		}
		let oneAway = false;
		let matchingCategory;
		const match = categories.some(category => {
			let matchCount = 0;
			for (const topic of category.topics) {
				if (selectionTexts.includes(topic)) {
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
			return (matchCount === 4) ? true : false;
		});
		let endMessage;
		if (match) {
			rightGuess(matchingCategory);
			// Removes matchingCategory from categories so shuffle works
			const index = categories.findIndex(category => category.title === matchingCategory.title);
			categories.splice(index, 1);
			console.log(JSON.stringify(categories));
			if (categoriesShown >= 4) {
				submitButton.disabled = true;
				shuffleButton.disabled = true;
				deselectButton.disabled = true;
				gameOver(categories, 'You win! Wow, you know so much about us :)');
			} else {
				deselectAll(submitButton, true);
			}
		} else {
			wrongGuess(oneAway, selectionTexts);
			if (tries <= 0) {
				submitButton.disabled = true;
				shuffleButton.disabled = true;
				deselectButton.disabled = true;
				gameOver(categories, 'Game over 😔 but hopefully you had fun anway!');
			}
		}
	});
	/* Needed for Firefox. Otherwise, it keeps button state on page
	   refresh: https://bugzilla.mozilla.org/show_bug.cgi?id=685657 */
	submitButton.disabled = true;
})();
