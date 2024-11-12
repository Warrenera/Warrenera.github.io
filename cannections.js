/* Changes background color to a random color with every button press. For practice purposes
function random(number) {
	return Math.floor(Math.random() * (number + 1));
}

document.querySelectorAll('.square').forEach(function(button) {
	button.addEventListener('click', () => {
		const randomColor = `rgb(${random(255)} ${random(255)} ${random(255)})`;
		document.body.style.backgroundColor = randomColor;
	});
});*/

let selectedCount = 0;

document.querySelectorAll('.square').forEach(button => {
	let selected = false;
	const classes = button.classList;
	
	button.addEventListener('click', () => {
		if (selected) {
			selected = false;
			selectedCount--;
			classes.toggle("selected");
		} else if (selectedCount < 4) {
			selected = true;
			selectedCount++;
			classes.toggle("selected");
		}
		console.log("Buttons selected: " + selectedCount);
	});
});
