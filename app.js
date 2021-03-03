let PORT = process.env.PORT || 6800;
let http = require('http');
let express = require('express');
let socketio = require('socket.io');
let formatMessage = require('./utils/messages');
let { userJoin, getCurrentUser, userLeave, getRoomUsers} = require('./utils/users');

let app = express();
let server = http.createServer(app);
let io = socketio(server);

//static files
app.use(express.static('./public'));

const botName = 'ChatApp Bot';

//Run when client connects
io.on('connection', socket=>{
    // console.log('New Ws connection...');

    //join chat room
    socket.on('joinRoom', ({username, room})=>{
        const user = userJoin(socket.id, username, room);

        socket.join(user.room);

        //display room theme
        socket.emit('room-theme', user.room);

        //Welcome current user
        socket.emit('message', formatMessage(botName, '<b>Welcome to chatApp!</b>'));

        //broadcast when a user connects
        socket.broadcast.to(user.room).emit('message', formatMessage(botName,`<b>${user.username}</b> has joined the chat`));

        //Send users and room info
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        });
    });

    //listen for chat message
    socket.on('chatMessage', (msg)=>{
        const user = getCurrentUser(socket.id);
        // io.to(user.room).emit('message', formatMessage(user.username, msg));
        socket.broadcast.to(user.room).emit('message', formatMessage(user.username, msg));
    });

    //runs when client disconnects
    socket.on('disconnect', ()=>{
        const user = userLeave(socket.id);

        if(user){
            io.to(user.room).emit('message', formatMessage(botName,`<b>${user.username}</b> has left the chat`));

            //Send users and room info
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room)
            });
        }
    });
});

//listen on port 6800
server.listen(PORT);
// console.log('Running...');