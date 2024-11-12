let selectedCount = 0;

document.querySelectorAll('.square').forEach(button => {
	button.textContent = 'Test';
	
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
