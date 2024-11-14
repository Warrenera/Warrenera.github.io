async function getData() {	
	const url = 'https://warrenera.github.io/cannections.json';
	const request = new Request(url);
	const response = await fetch(request);
	return await response.json();
}

const categories = getData();

let selectedCount = 0;

document.querySelectorAll('.square').forEach(button => {
	button.textContent = categories[0]["topics"][0];
	
	let selected = false;
	const classes = button.classList;
	
	button.addEventListener('click', () => {
		if (selected) {
			selected = false;
			selectedCount--;
			classes.toggle('selected');
		} else if (selectedCount < 4) {
			selected = true;
			selectedCount++;
			classes.toggle('selected');
		}
		console.log('Buttons selected: ' + selectedCount);
	});
});
