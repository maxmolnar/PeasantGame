//function.js
var express = require('express');
var app = express();
var http = require('http').Server(app);
//var io = require('socket.io')(http);
var List = require('collections/list');
var SortedArrayMap = require('collections/sorted-array-map');
var fs = require('fs');

//Starting a collection of config vars here, theoretically they'll get moved to their own file soon
var boardSize = 50;

//npc map, sorted by id
npcs = new SortedArrayMap();

//player map, sorted by id
var players = new SortedArrayMap();

//Array of interactions and moves to be updated
var interactions = new List();
var moves = new List();

//Allows calls from other files
module.exports = function() {
	//initializes game state at server start up
	this.init = function() {

		var board = [];
		//Hard coded values for now
		for (var i = 0; i < boardSize; i++) {
			var ter = 'grass';
			var stand = 'empty';

			//spawn 3 npcs
			if (i === 15 || i === 20 || i === 30) {
				stand = 'peasant';

				//TODO: define stats
				var id = getNextID(players);
				var name = getName();
				npcs.add({id:id,
						name: name,
						tile : i,
						role : 'peasant',
						strength : 4}, id);
			} else if (i === 25) {
				stand = 'base';
			} else if (i === 4 || i === 6 || i === 43) {
				stand = 'tree';
			}
			board[i] = {terrain: ter,
						standing: stand};
		}

		var json = JSON.stringify(board);
		fs.writeFile('json/board.json', json, 'utf8');        
	}

	//updates entire board state every 5 seconds
	this.update = function() {

		console.log('updating');
		var data = fs.readFileSync('json/board.json', 'utf-8');
		var board = JSON.parse(data);
		
		//loop through npc list
		var arr = npcs.toArray();
		for (var i = 0; i < arr.length; i++) {
			//assign actions

		}

		//update interactions first
		 
		//update moves last

		io.emit('board state',board);
	}

	//call this when player first connects to game server
	this.playerSpawn = function() {
		//draws board immediately on connection
		var data = fs.readFileSync('json/board.json', 'utf-8');
		var board = JSON.parse(data);
		io.emit('board state',board);

		var id = getNextID(players);
		var name = getName();

		players.add({id:id,
					name: name,
					tile : 1,
					role : 'peasant',
					strength : 4}, id);
		board[4].standing = 'peasant';

		//this may not overwrite completely if new board value has a smaller length
		var json = JSON.stringify(board);
		fs.writeFile('json/board.json', json, 'utf8');

	}

	//adds turn object to proper list
	this.commitTurn = function(id, tile) {
		turn = {id: id,
				tile: tile};

		var data = fs.readFileSync('json/board.json', 'utf-8');
		var board = JSON.parse(data);
		
		//move
		if (board[tile].standing == 'empty') {
			//list = move list
		}

		//interaction
		else {
			//list = interaction list
		}
		//list.push(turn)
	}
}

//returns lowest available id for given map
var getNextID = function(map) {
	var arr = map.toArray();
	var i = 0; 
	while (arr[i] === i) {
		i++;
	}
	return i; 
}

var getName = function() {
	var data = fs.readFileSync('json/names.txt', 'utf-8');
	var names = data.split('\n');
	console.log(names);
	return 'Nick';
}
