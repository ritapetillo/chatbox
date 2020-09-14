import express from "express";
import path, { format } from "path";
import http from "http";
import socket from "socket.io";

const app = express();
const users = [];

const PORT = 3000;
//create server
const server = http.createServer(app);
const io = socket.listen(server);

//SOCKET
io.on("connection", (socket) => {
  //user connect
  socket.on("user_connect", (userChat) => {
    const user = {
      username: userChat.username,
      chatRoom: userChat.chatName,
      id: socket.id,
    };
    socket.join(user.chatRoom);

    const index = users.findIndex((user) => user.id === socket.id);
    if (index === -1) {
      users.push(user);
    }

    //socket.join(user.chatRoom);
    io.emit("users_list", users);
  });

  //user disconnet
  socket.on("disconnect", () => {
    const index = users.findIndex((user) => user.id === socket.id);
    console.log(`socket ${socket.id} disconnesso`);
    if (index !== -1) {
      return users.splice(index, 1)[0];
    }
    console.log(users);

    io.emit("users_list", users);
  });

  //user connect
  socket.on("connect", (message) => {
    socket.emit("message", message);
  });

  socket.on("message", (message) => {
    socket.emit("messsage", "connected");
  });

  //Receive message from chat
  socket.on("chatMessage", (msg) => {
    //create a message object
    const message = {
      text: msg.msg,
      username: msg.username,
    };
    //send the message object to client
    io.to(msg.chatName).emit("message", message);
  });
  //RECEIVE USER IS TYPING

  socket.on("user_typing", (username) => {
    socket.broadcast
      .to(username.chatName)
      .emit("user_typing", username.username);
  });
  socket.on("user_stop-typing", (username) => {
    socket.broadcast.to(username.chatName).emit("user_stop-typing", username);
    console.log("stop typing");
  });
});

app.use(express.static("public"));

//connect app
server.listen(PORT, () => {
  console.log(`connected to ${PORT}`);
});
