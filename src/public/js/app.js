const messageList = document.querySelector("ul");
const nickForm = document.querySelector("#nick");
const messageForm = document.querySelector("#message");

// backend와 connection 열어줌
const socket = new WebSocket(`ws://${window.location.host}`);

function makeMessage(type, payload) {
    const msg = {type, payload};
    console.log(msg);
    return JSON.stringify(msg);
}

function handleOpen() {
    console.log("Connected to Server");
}

function handleClose() {
    console.log("Disconnected from the Server");
}

// socket이 열렸을때 실행
socket.addEventListener("open", handleOpen);

// backend에서 message를 받았을때 실행
socket.addEventListener("message", (message) => {
    const li = document.createElement("li");
    li.innerText = message.data;
    messageList.append(li);
});

// backend와의 연결이 끊겼을때 실행
socket.addEventListener("close", handleClose);

function handleSubmit(event) {
    event.preventDefault();
    const input = messageForm.querySelector("input");
    socket.send(makeMessage("new_message", input.value));
    const li = document.createElement("li");
    li.innerText = `You : ${input.value}`;
    messageList.append(li);
    input.value = "";
}

function handleNickSubmit(event) {
    event.preventDefault();
    const input = nickForm.querySelector("input");
    socket.send(makeMessage("nickname", input.value));
    input.value = "";
}

messageForm.addEventListener("submit", handleSubmit);
nickForm.addEventListener("submit", handleNickSubmit);