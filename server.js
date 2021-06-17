const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const io = require('socket.io')(server);

app.use('/images', express.static(__dirname + '/images'));
app.use('/', express.static(__dirname + '/dist'));
app.use('/css', express.static(__dirname + '/visor3d/css'));

app.get('/visor', (req, res) => {
  res.sendFile(__dirname + '/dist/index.html');
});

app.get('/proyector', (req, res) => {
  res.sendFile(__dirname + '/proyector.html');
});

io.on('connection', (socket) => {
  socket.on('tecla', (tecla) => {
    io.emit('tecla', tecla);
  });
  socket.on('icon', (coords) => {
    io.emit('icon', coords);
  });
  socket.on('linea', (positions) => {
    console.log( positions );
    io.emit('linea', positions);
  });
  socket.on('remove', (id) => {
    io.emit('remove', id);
  });
});

server.listen(3000, () => {
  console.log('escuchando puerto 3000');
});
