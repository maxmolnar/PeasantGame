var express = require('express');
var app = express();
var http = require('http').Server(app);
var functions = require('/js/Functions.js')();

//IDK if this works or not
init();
//sets update to run every 5 seconds
setInterval(update, 5000);

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

app.use(express.static(__dirname + '/js'));


http.listen(3000, function () {
    console.log('listening on *:3000');
});

