const socket = io();
//-----GET USERNAME AND CHATNAME FROM URL
const { username, chatName } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});
const messageBoard = document.querySelector(".chat__messageContainer-messages");

//-----SHOOT CONNECT EVENT WHEN DOM LOADS
document.addEventListener("DOMContentLoaded", () => {
  const msg = {
    text: `Welcome to ChatBox ${username}`,
    username: "Admin",
  };
  outputMessage(msg);
  socket.emit("user_connect", { username, chatName });
});

//----SHOOT DISCONNECT EVENT WHEN USER DISCONNECTS
window.addEventListener("unload", (username) => {
  socket.emit("disconnect", username);
});

//----EMIT MESSAGE TO THE SERVER
chatForm.addEventListener("submit", (e) => {
  e.preventDefault();
  //get message value
  const msg = e.target.elements.chatMessage.value;
  //emit message to the server
  socket.emit("chatMessage", { msg, username, chatName });
  e.target.elements.chatMessage.value = "";
});

//----EMIT MESSAGE FROM THE SERVER TO CLIENT
socket.on("message", (msg) => {
  //output message
  outputMessage(msg);
  messageBoard.scrollTop = messageBoard.scrollHeight;
});

//Output message function
const outputMessage = (msg) => {
  const div = document.createElement("div");
  const guest = "chat-message-guest";
  const host = "chat-message";

  div.classList.add(msg.username === username ? host : guest);
  div.innerHTML = `<p>
    <span class="chat-message__time">10.30 PM</span>
    <span class="chat-message__user">${msg.username}</span>
  </p>
  <p class="chat-message__text">${msg.text}</p>`;
  document.querySelector(".chat__messageContainer-messages").appendChild(div);
};

//----PRINT THE USER LIST
socket.on("users_list", async (users) => {
  await cleanDiv();

  users.map((user) => {
    if (user.chatRoom === chatName) {
      const div = document.createElement("div");
      div.classList.add("chat__userList-user");
      div.innerHTML = `<span style=${
        user.username === username ? "font-weight:600" : ""
      }>${user.username}</span>`;
      document.querySelector(".chat__userList").appendChild(div);
    }
  });
});
const cleanDiv = () => {
  const div = document.querySelector(".chat__userList");
  div.innerHTML = "";
};

//---SEND USER TYPING TO THE SERVER
document.getElementById("chatMessage").addEventListener("keydown", (e) => {
  socket.emit("user_typing", { username, chatName });
});

//---RECEIVE USER TYPING FROM SEVER AND PRINT CLIENTS
socket.on("user_typing", (username) => {
  const div = document.createElement("div");
  div.classList.add("chat__user-typing");
  div.innerHTML = `<p>${username} is typing</p>`;
  document.querySelector(".chat__messageContainer-messages").appendChild(div);
});

//---SEND USER STOP TYPING TO THE SERVER

document.getElementById("chatMessage").addEventListener("keyup", (e) => {
  socket.emit("user_stop-typing", { username, chatName });
  console.log("keyup");
});

//---RECEIVE USER STOP TYPING FROM SEVER AND PRINT CLIENTS

socket.on("user_stop-typing", (username) => {
  const userTypeDiv = document.querySelectorAll(".chat__user-typing");
  userTypeDiv.forEach((div) => {
    document.querySelector(".chat__messageContainer-messages").removeChild(div);
  });
});
