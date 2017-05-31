var express = require('express');
var app = express();
var http = require('http').Server(app);
var functions = require('./js/Functions.js')();
io = require('socket.io')(http);
var List = require("collections/list");
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
	//master handles all calculations
  console.log(`Master ${process.pid} is running`);

  // Fork workers.
  for (var i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
  });

  //Initilize game board
  init();

  //sets update to run every 5 seconds
  setInterval(update, 5000);
  console.log('Master updating board');

} else {
  //Workers handle all communication

  app.get('/', function (req, res) {
    res.sendFile(__dirname + '/Index.html');
  });

  app.use(express.static(__dirname + '/js'));

  io.on('connection', function(socket){
    console.log('client: ' + socket.id + ' connected');
    playerSpawn(); 
  });

  http.listen(3000);
  console.log(`Worker ${process.pid} listening on *:3000`);
}
