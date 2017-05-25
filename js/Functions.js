//function.js

//Array of tile objects - holds game state
var board = [];
var npcs = [];
var players = [];

//Theoretically allows calls from other files
module.exports = function() {
	//initializes game state at server start up
	this.init = function() {
		for (var i = 0; i < 50; i++) {
			var ter = 'grass';
			var stand = 'empty';
			if (i === 15 || i === 25 || i === 30) {
				stand = 'peasant';
				
			}
			board[i] = {terrain: ter,
						standing: stand};
		}
	}

	this.update = function() {
		console.log("updating");	
	}
}