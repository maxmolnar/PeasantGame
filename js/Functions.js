//function.js
var express = require('express');
var app = express();
var http = require('http').Server(app);
//var io = require('socket.io')(http);
var List = require('collections/list');
var SortedArrayMap = require('collections/sorted-array-map');
var fs = require('fs');

//Starting a collection of config vars here, theoretically they'll get moved to their own file soon
var config = JSON.parse(fs.readFileSync('json/config.json','utf-8'));

//Array of interactions and moves to be updated
var interactions = new List();
var moves = new List();

//Allows calls from other files
module.exports = function() {
	//initializes game state at server start up
	this.init = function() {

		console.log("Initializing board state");
		var board = [];
		var npcs = new SortedArrayMap();
		var players = new SortedArrayMap();

		players.add({id : 0,
					name : 'head'}, 0);
		var id = 0;
		//Hard coded values for now
		for (var i = 0; i < config.boardSize; i++) {
			var boardLength = Math.floor(Math.sqrt(config.boardSize));
			var ter = 'grass';
			var stand = 'empty';

			//Make borders water
			if (i < boardLength || i % boardLength == 0 || (i + 1) % boardLength == 0 || i > (config.boardSize - boardLength)) {
				ter = 'water';

			//create 2 bases **Only 1 for now**
			} else if (i == (config.baseModifier * boardLength + config.baseModifier)) {
				stand = 'base'; 
				//update structure list

			//Spawn resources randomly
			} else if ((var chance = Math.random()) < (config.baseTreeRate + config.baseStoneRate + config.baseBerryRate)) {
				if (chance > (config.baseTreeRate + config.baseStoneRate)) {
					stand = 'berry';
				} else if (chance > config.baseTreeRate) {
					stand = 'stone';
				} else {
					stand = 'tree';
				}
			}
			board[i] = {terrain: ter,
						standing: stand};
		}

		//Spawn 5 npc peasants near base
		var location;
		for (i = 0; i < 5; i++) {

			location = getSpawn();
			while (board[location].standing != 'empty') {
				location = getSpawn();
			}

			board[location].standing = 'peasant';

			var name = getName();
				npcs.add({id : i,
					name: name,
					tile : 1,
					role : 'peasant',
					stats : {strength : 4,
						health : 5,
						maxHealth : 5,
						faith : 0,
						luck : 4},
					equipped : {head : {},
						gloves : {},
						chest : {},
						pants : {},
						boots : {},
						weapon : {}},
					inventory : {},
					quest : 'Gather Wood'
				}, i);
		}

		fs.writeFile('json/players.json', JSON.stringify(players), 'utf-8');
		fs.writeFile('json/board.json', JSON.stringify(board), 'utf8');   
		fs.writeFile('json/npcs.json', JSON.stringify(npcs), 'utf-8');     
	}

	//updates entire board state every 5 seconds
	this.update = function() {

		console.log('Calculating Update');

		var board = JSON.parse(fs.readFileSync('json/board.json', 'utf-8'));
		var npcs = JSON.parse(fs.readFileSync('json/npcs.json', 'utf-8'));
		
		//loop through npc list
		var arr = npcs.toArray();
		for (var i = 0; i < arr.length; i++) {
			//assign actions

		}

		//update interactions first
		 
		//update moves last


		//this may not overwrite completely if new board value has a smaller length
		fs.writeFile('json/board.json', JSON.stringify(board), 'utf8');
		fs.writeFile('json/npcs.json', JSON.stringify(npcs), 'utf-8');

		io.emit('board state',board);
	}

	//call this when player first connects to game server
	this.playerSpawn = function(clientID) {
		//draws board immediately on connection
		var board = JSON.parse(fs.readFileSync('json/board.json', 'utf-8'));
		io.emit('board state',board);

		var players = JSON.parse(fs.readFileSync('json/players.json', 'utf-8'));

		//design choich - undecided
		//var id = getNextID('players');
		var id = clientID;
		var name = getName();

		var location;

		location = getSpawn();
		while (board[location].standing != 'empty') {
			location = getSpawn();
		}

		board[location].standing = 'peasant';

		var name = getName();
		players.add({id : clientID,
			name: name,
			tile : 1,
			role : 'peasant',
			stats : {strength : 4,
				health : 5,
				maxHealth : 5,
				faith : 0,
				luck : 4},
			equipped : {head : {},
				gloves : {},
				chest : {},
				pants : {},
				boots : {},
				weapon : {}},
			inventory : {},
			quest : 'Gather Wood'
		});

		//this may not overwrite completely if new board value has a smaller length
		fs.writeFile('json/board.json', JSON.stringify(board), 'utf8');
		fs.writeFile('json/players.json', JSON.stringify(players), 'utf-8');

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

//SHOULD return lowest available id for given map
//actually just returns nth number 
var getNextID = function(type) {
	var map = JSON.parse(fs.readFileSync('json/' + type + '.json', 'utf-8'));
	var i = 1;

	while (map[i] != undefined) {
		if (map[i].id != (i-1)) {
			console.log(map[0][i].id + '!=' + i);
			break;
		}
		i++;
	}
	return (i-1); 
}

//returns random name from names.txt
var getName = function() {
	var data = fs.readFileSync('json/names.txt', 'utf-8');
	var names = data.split('\n');
	var name = names[Math.floor(Math.random() * names.length)]
	console.log(name + " has joined the game");
	return name;
}

var getSpawn = function() {
	var boardLength = Math.sqrt(config.boardSize);
	var locX = Math.floor(Math.random() * 5);
	var locY = Math.floor(Math.random() * 5);
	return (locX + locY * boardLength);
}