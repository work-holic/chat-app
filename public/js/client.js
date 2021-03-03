let chatForm = document.getElementById('chat-form');
let chatInput = document.getElementById('msg');
let chatMessages = document.querySelector('.chat-messages');
let roomName = document.getElementById('room-name');
let userList = document.getElementById('users');
let leaveButton = document.querySelector('.chat-header .leave-btn');

//get username and room from url
const {username, room} = Qs.parse(location.search, {
    ignoreQueryPrefix: true
});

// console.log(username, room);

const socket = io();

// join chat room
socket.emit('joinRoom', {username, room});

// displaying room theme
socket.on('room-theme', (theme)=>{
    document.querySelector('.chat-messages').classList.add(theme);
});

// Get room and users
socket.on('roomUsers', ({room, users})=>{
    outputRoomName(room);
    outputUsers(users);
});


socket.on('connect', function(data){
    socket.emit('join', 'Hello from client');
});

//Message from server
socket.on('message', message=>{
    // console.log(message);
    outputMessage(message);

    //scroll down
    chatMessages.scrollTop = chatMessages.scrollHeight;
});

//message submit
chatForm.addEventListener('submit', (e)=>{
    e.preventDefault();
    
    //get message text
    const msg = chatInput.value;

    //output own message
    outputOwnMessage(msg);

    //Emit message to server
    socket.emit('chatMessage', msg);

    //clear input
    chatInput.value = "";
    chatInput.focus();
});

//ouput message to DOM
function outputMessage(message){
    const div = document.createElement('div');
    div.classList.add('message');
    div.classList.add(message.position);
    div.innerHTML = `<p class="meta">${message.username}<span>${(message.position == 'left') ? message.time : ''}</span></p>
    <p class="text">
        ${message.text}
    </p>`;
    document.querySelector('.chat-messages').appendChild(div); 

    //scroll down
    chatMessages.scrollTop = chatMessages.scrollHeight;

    //play audio when receive message
    if(message.position === 'left')
        document.getElementById('audio').play();
} 

//ouput message to DOM
function outputOwnMessage(message){
    const position = 'right';
    const div = document.createElement('div');
    div.classList.add('message');
    div.classList.add(position);
    div.innerHTML = `<p class="meta">You<span>${moment().format('h:mm a')}</span></p>
    <p class="text">
        ${message}
    </p>`;
    document.querySelector('.chat-messages').appendChild(div); 

    //scroll down
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

//Add room name to DOM
function outputRoomName(room){
    roomName.innerText = room; 
}

//add users to DOM
function outputUsers(users){
    userList.innerHTML = `
        ${users.map(user => `<li>${user.username}</li>`).join('')}
    `;
}

//Prompt user before leaving chat room
leaveButton.addEventListener('click', ()=>{
    const leaveRoom = confirm('Are you sure you want to leave the chatRoom ?');

    if(leaveRoom){
        window.location = '../index.html';
    }
});