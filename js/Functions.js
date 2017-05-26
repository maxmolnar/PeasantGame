//function.js
var express = require('express');
var app = express();
var http = require('http').Server(app);
//var io = require('socket.io')(http);
var List = require("collections/list");

//Starting a collection of config vars here, theoretically they'll get moved to their own file soon
var boardSize = 50;

//Array of tile objects - holds game state
board = [];

//List of current npcs - might change to heap of IDs
npcs = new List();

//List of current players - might change to hea of IDs
var players = new List();

//Theoretically allows calls from other files
module.exports = function() {
	//initializes game state at server start up
	this.init = function() {
		for (var i = 0; i < boardSize; i++) {
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
        io.emit('board state',board);
	}
}