var server = require('http').createServer(handler);
var io = require('socket.io').listen(server);
var fs = require('fs');

server.listen(9000);

function handler (req, res) {
  fs.readFile(__dirname + '/index.html',
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }
    res.writeHead(200);
    res.end(data);
  });
}

io.sockets.on('connection', function (socket) {
  socket.on('signal', function (data) {
    console.log('Received signal: ', data);
    socket.emit('signal', data);
  });
});
