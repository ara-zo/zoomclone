
// backend와 connection 열어줌
const socket = new WebSocket(`ws://${window.location.host}`);

function handleOpen() {
    console.log("Connected to Server");
}

function handleMessage(message) {
    console.log("New message : ", message.data);
}

function handleClose() {
    console.log("Disconnected from the Server");
}

// socket이 열렸을때 실행
socket.addEventListener("open", handleOpen);

// backend에서 message를 받았을때 실행
socket.addEventListener("message", handleMessage);

// backend와의 연결이 끊겼을때 실행
socket.addEventListener("close", handleClose);

setTimeout(() => {
    // frontend에서 backend로 message 보냄
    // buffer로 보내짐 나중에 수정 예정
    socket.send("hello from th browser!");
}, 10000);