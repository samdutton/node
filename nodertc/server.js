var static = require('node-static');
var http = require('http');
var file = new(static.Server)();
var server = http.createServer(function (req, res) {
  file.serve(req, res);
}).listen(9000);

var io = require('socket.io').listen(server);

io.sockets.on('connection', function (socket){

socket.on('create or join', function (room) {
	log('Request to create or join room ', room);

	var numClients = io.sockets.clients(room).length;
	log('Room ' + room + ' has ' + numClients + ' client(s)');

	if (numClients == 0){
		socket.join(room);
		socket.emit('empty', room);
	} else if (numClients == 1) {
		io.sockets.in(room).emit('join', room);
		socket.join(room);
	} else {
		socket.emit('full', room);
	}
	socket.emit('emit(): client ' + socket.id + ' joined room ' + room);
	socket.broadcast.emit('broadcast(): client ' + socket.id + ' joined room ' + room);

	function log(){
		var array = [">>> "];
	  for (var i = 0; i < arguments.length; i++) {
	  	array.push(arguments[i]);
	  }
	    socket.emit('log', array);
	}

});



});

