class Cannections {
	static const colors = [
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
	
	constructor(data) {
		this.categoriesShown = 0;
		this.priorGuesses = [];
		this.selectCount = 0;
		this.selections = [];
		this.results = 'cAnnections';
		this.tries = 4;
		
		this.categories = shuffleArray(data);
		/* Colors assigned dynamically/randomly. No
	   correlation to difficulty unlike the real game */
		for (let i = 0; i < categories.length; i++) {
			categories[i].color = colors[i];
		}
		this.unselectedTopics = shuffle(this.categories);
		this.addText();
		this.buttons = document.querySelectorAll('.square');
		this.deselectButton = document.querySelector('#deselect');
		this.shuffleButton = document.querySelector('#shuffle');
		this.submitButton = document.querySelector('#submit');
		
		// TODO?
		this.deselectButton = new DeselectButton();
		this.shuffleButton = new ShuffleButton();
		this.submitButton = new SubmitButon();
	}

	shuffleArray(array) {
		// Implementation of the Fisher–Yates shuffle
		for (let i = array.length - 1; i >= 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[array[i], array[j]] = [array[j], array[i]];
		}
		return array;
	}
	
	shuffle(categories) {
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
	
	addText() {
		let i = 0;
		for (const button of this.buttons) {
			if (button.style.visibility === 'hidden') {
				continue;
			} else {
				button.textContent = this.unselectedTopics[i];
				i++;
			}
		}
	}
}

async function getData() {	
	const response = await fetch('https://warrenera.github.io/topics.json');
	return await response.json();
}

async function main() {
	data = await getData().slice(0, 4);
	cannections = new Cannections(data);
	
	for (const button of cannections.buttons) {
		button.addEventListener('click', () => {
			buttonLogic(button, selections, unselectedTopics);
			cannections.submitButton.disabled = (selectCount === 4) ? false : true;
			cannections.deselectButton.disabled = (selectCount === 0) ? true : false;
		});
	}
	
	cannections.deselectButton.addEventListener('click', () => {
		cannections.deselectAll();
	});
	
	cannections.shuffleButton.addEventListener('click', () => {
		cannections.deselectAll();
		cannections.unselectedTopics = shuffle(categories);
		addText(buttons, unselectedTopics);
	});
}