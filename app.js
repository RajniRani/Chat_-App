const express = require('express');
const app = express();
const path = require("path");

const server = require('http').createServer(app);
const io = require('socket.io')(server);

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

let usersCount = 0;
const users = {}; // Store users' names by socket ID

app.get('/', function (req, res) {
    res.render('index');
});

app.get('/name', function (req, res) {
    res.render('name');
});

app.get('/chat', function (req, res) {
    const userName = req.query.userName;
    res.render("chat", { userName });
});

io.on('connection', function (socket) {
    console.log(`User connected: ${socket.id}`);
    usersCount++;
    io.emit('user-update', { count: usersCount });

    socket.on('send-message', function (data) {
        console.log(`Message from user ${socket.id}: ${data.message}`);
        socket.broadcast.emit('receive-message', data); // Broadcast message with user name
    });

    socket.on('typing', function (data) {
        socket.broadcast.emit('typing', data); // Broadcast typing status with user name
    });

    socket.on('disconnect', function () {
        console.log(`User disconnected: ${socket.id}`);
        usersCount--;
        io.emit('user-update', { count: usersCount });
        console.log(`Total users: ${usersCount}`);
    });
});

server.listen(3000);


