//function.js

//Array of tile objects - holds game state
var board = [];
//List of current npcs
var npcs = new List();
//List of current players
var players = new List();

//Theoretically allows calls from other files
module.exports = function() {
	//initializes game state at server start up
	this.init = function() {
		for (var i = 0; i < 50; i++) {
			var ter = 'grass';
			var stand = 'empty';

			//spawn 3 npcs
			if (i === 15 || i === 25 || i === 30) {
				stand = 'peasant';
				npcs.push({tile : i,
						role : 'peasant',
						strength : 4});
			}
			board[i] = {terrain: ter,
						standing: stand};
		}
	}

	this.update = function() {
		console.log("updating");	
	}
}