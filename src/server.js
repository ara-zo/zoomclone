import http from "http";
import WebSocket from "ws";
import express from "express";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

const handleListen = () => console.log("Listening on http://localhost:3000");

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

function onSocketClose() {
    console.log("Disconnected from the Browser")
}

const sockets = [];

// connection이 생기면 socket에서 누가 연결했는지 알 수 있음
// 새로운 브라우저가 내 서버에 들어오면 실행됨
wss.on("connection", (socket) => {
    sockets.push(socket);
    socket["nickname"] = "Anon";
    console.log("Connected to Browser");

    // 브라우저 탭을 닫거나 컴퓨터가 잠자기 모드에 들어가면 이벤트 발생
    socket.on("close", onSocketClose);

    // 특정 socket에서 메시지를 받았을때 발생
    socket.on("message", (msg) => {
        const message = JSON.parse(msg);
        console.log(socket.nickname);
        console.log(`message: ${message.type} ${message.payload}`);
        // 모든 socket에 message를 보냄
        switch (message.type) {
            case "new_message" :
                sockets.forEach((aSocket) => aSocket.send(`${socket.nickname}: ${message.payload}`));
                break;
            case "nickname" :
                socket["nickname"] = message.payload;
                break;
        }
    });
});

server.listen(3000, handleListen);