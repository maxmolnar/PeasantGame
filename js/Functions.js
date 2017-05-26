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

//Array of interactions and moves to be updated
var interactions = new List();
var moves = new List();

//Allows calls from other files
module.exports = function() {
	//initializes game state at server start up
	this.init = function() {

		//Hard coded values for now
		for (var i = 0; i < boardSize; i++) {
			var ter = 'grass';
			var stand = 'empty';

			//spawn 3 npcs
			if (i === 15 || i === 20 || i === 30) {
				stand = 'peasant';

				//TODO: define stats
				npcs.push({tile : i,
						role : 'peasant',
						strength : 4});
			} else if (i === 25) {
				stand = 'base';
			} else if (i === 4 || i === 6 || i === 43) {
				stand = 'tree';
			}
			board[i] = {terrain: ter,
						standing: stand};
		}
        
	}

	this.update = function() {
		console.log("updating");
		//loop through npc list; assign actions

		//update interactions first
		 
		//update moves last
        io.emit('board state',board);
	}

	//call this when player first connects to game server
	this.playerSpawn = function() {
		players.push({tile : 4,
					role : 'peasant',
					strength : 4});
		board[4].standing = 'peasant';
	}
}