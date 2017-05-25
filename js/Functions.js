//function.js

//Array of tile objects - holds game state
var board = [];

//Theoretically allows calls from other files
module.exports = function() {
	//initializes game state at server start up
	this.init = function() {
		for (var i = 0; i < 50; i++) {
			board[i] = {terrain: 'grass',
						standing: 'peasant'};
		}
	}

	this.update = function() {
		console.log("updating");
	}
}