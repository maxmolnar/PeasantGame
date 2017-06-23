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
var boardLength = Math.sqrt(config.boardSize);
var lock = 0;

//Array of interactions and moves to be updated
var interactions = new List();
var moves = new List();

//Allows calls from other files
module.exports = function() {
	//initializes game state at server start up
	this.init = function() {

		console.log("Initializing board state");
		var board = [];
		var structures = [];
		var boardLength = Math.floor(Math.sqrt(config.boardSize));
		var npcs = [];
		var players = [];

		//give client config information
		console.log('emitting');
		io.emit('config',config);

		//players.add({id : 0,
		//			name : 'head'}, 0);
		var id = 0;
		//Hard coded values for now
		for (var i = 0; i < config.boardSize; i++) {
			var chance = Math.random();
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
			} else if (chance < (config.baseTreeRate + config.baseStoneRate + config.baseBerryRate)) {
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
			while (board[location].standing !== 'empty' || board[location].terrain == 'water') {
				location = getSpawn();
			}

			board[location].standing = 'peasant';

			var name = getName();
			npcs[i] = {name: name,
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
			};
		}

		fs.writeFile('json/players.json', JSON.stringify(players), 'utf-8');
		fs.writeFile('json/board.json', JSON.stringify(board), 'utf8');   
		fs.writeFile('json/npcs.json', JSON.stringify(npcs), 'utf-8');     
		fs.writeFile('json/interactions.json', '[]', 'utf-8');
		fs.writeFile('json/moves.json', '[]', 'utf-8');
	}

	//updates entire board state every 5 seconds
	this.update = function() {

		console.log('Calculating Update');

		var board = JSON.parse(fs.readFileSync('json/board.json', 'utf-8'));
		var npcs = JSON.parse(fs.readFileSync('json/npcs.json', 'utf-8'));
		var interactions = JSON.parse(fs.readFileSync('json/interactions.json', 'utf-8'));
		var moves = JSON.parse(fs.readFileSync('json/moves.json', 'utf-8'));

		if (lock === 1) {
			console.log('Atomic Error tell max');
		}
		lock = 1;
		
		//loop through npc list and assign actions

		//update interactions first
		 
		//update moves last


		//this may not overwrite completely if new board value has a smaller length
		fs.writeFile('json/board.json', JSON.stringify(board), 'utf8');
		fs.writeFile('json/npcs.json', JSON.stringify(npcs), 'utf-8');
		fs.writeFile('json/interactions.json', '[]', 'utf-8');
		fs.writeFile('json/moves.json', '[]', 'utf-8');

		lock = 0;
		io.emit('board state',board);
		console.log('updated');
	}

	//call this when player first connects to game server
	this.playerSpawn = function(clientID) {
		//draws board immediately on connection
		var board = JSON.parse(fs.readFileSync('json/board.json', 'utf-8'));
		io.emit('config',config);
        io.emit('board state',board);
        
		if (lock === 1) {
			console.log('atomic error tell max');
		}
		lock = 1;

		var players;
		try {	
			players = JSON.parse(fs.readFileSync('json/players.json', 'utf-8'));
		} catch(err) {
			console.log('creating player array');
			players = [];
		}


		//design choich - undecided
		//var id = getNextID('players');
		var id = clientID;
		var name = getName();
		console.log(name);

		var location;

		location = getSpawn();
		while (board[location].standing != 'empty' || board[location].terrain == 'water') {
			location = getSpawn();
		}

		board[location].standing = 'peasant';

		var n = 0;
		while (players[n] !== undefined) {
			n++;
		}

		var location = getSpawn();
		while (board[location].standing !== 'empty' || board[location].terrain == 'water') {
			location = getSpawn();
		}

		board[location].standing = 'peasant';		
		players[n] = {id : clientID,
			name: name,		
			tile : location,
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
		};

		//this may not overwrite completely if new board value has a smaller length
		fs.writeFile('json/board.json', JSON.stringify(board), 'utf8');
		fs.writeFile('json/players.json', JSON.stringify(players), 'utf-8');

		lock = 0;

	}

	//adds turn object to proper list
	//call this on hex click <--NICK--> check out index.js ~line 38 also
	this.commitTurn = function(id, tile, action) {
		turn = {id: id,
				tile: tile,
				action: action};

		if (lock === 1) {
			console.log('atomic error tell max');
		}
		lock = 1;

		var board = JSON.parse(fs.readFileSync('json/board.json', 'utf-8'));
		var list;

		//move
		if (action === 'move') {
			list = 'moves';
		}

		//interaction
		else {
			list = 'interactions';
		}

		var listData = JSON.parse(fs.readFileSync('json/' + list + '.json', 'utf-8'));
		listData.add(turn);
		fs.writeFile('json/' + list + '.json', 'utf-8');
		lock = 0;
	}
}

//is this even used?
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
	console.log(name + ' has joined the game');
	return name;
}

//returns location 5 hex away from base
//update for more flexibility sometime
var getSpawn = function() {
	var boardLength = Math.sqrt(config.boardSize);
	var locX = config.baseModifier + (Math.floor(Math.random() * 5 - 2.5));
	var locY = config.baseModifier + (Math.floor(Math.random() * 5 - 2.5));
	return (locX + locY * boardLength);
}

//returns path array to nearest tile with standing to location
var bfs = function(location, standing, board) {
	//create frontier,visited,cameFrom arrays
	var frontier = [];
	var visited = [boardSize];
	var cameFrom = [boardSize];
	var path = [];
	var dif = boardLength;
	var current = location;

	if ((location / boardLength) % 2 == 0) {
		dif--;
	}
 	var neighbors = [-dif, -dif + 1, -1, 1, dif, dif + 1];
	//add location to visited
	visited[current] = 1;

	//add valid neighbors to frontier, uptdate cameFrom
	var nbor, n, adjacent, i;
	do {
		for (var i = 0; i < 6; i++) {
			adjacent = 0;
			//validate neighbor
			//legit nbor, no standing, not visited
			n = current + neighbors[i]];
			nbor = board[n];

			if (nbor.terrain === 'grass') {
				adjacent = 1;
			}

			if (adjacent === 1 && nbor.standing === 'empty' && visited[n] != 1) {
				//add nbor to end of frontier
				if (nbor.standing === standing) {
					//n is target destination
					i = 1;
					path[0] = n;
					//deconstruct cameFrom array and return it
					while (path[i] != location) {
						path[i] = cameFrom[path[i-1]];
						i++;
					}
					return path;
				}
				//add nbor to end of frontier, visited
				visited[current] = 1;
				frontier[frontier.length] = n;
				cameFrom[n] = current;
			}
		}
		//goto next frontier, repeat
		current = frontier.shift;
	} while (frontier.length > 0);
	//object not found
	return 0;
}
