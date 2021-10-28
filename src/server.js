import http from "http";
import SocketIO from "socket.io";
import express from "express";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

const handleListen = () => console.log("Listening on http://localhost:3000");

const httpServer = http.createServer(app);
// io 서버 생성
const wsServer = SocketIO(httpServer);

function publicRooms() {
    const {
        sockets: {
            adapter: {sids, rooms}
        }
    } = wsServer;
    // public room list 생성
    const publicRooms = [];
    rooms.forEach((_, key) => {
        if (sids.get(key) === undefined) {
            publicRooms.push(key);
        }
    });
    return publicRooms;
}

wsServer.on("connection", (socket) => {
    socket["nickname"] = "Anon";

    // middleware같은거
    socket.onAny((event) => {
        console.log(`Socket Event: ${event}`);
    });

    // room 입장
    socket.on("enter_room", (roomName, done) => {
        socket.join(roomName);
        done();
        socket.to(roomName).emit("welcome", socket.nickname);
        wsServer.sockets.emit("room_change", publicRooms());
    });

    // 연결종료 직전
    // disconnecting event socket이 방을 떠나기 바로 직전에 발생
    socket.on("disconnecting", (reason) => {
        socket.rooms.forEach((room) => socket.to(room).emit("bye", socket.nickname));

    });

    // 완전 연결종료
    socket.on("disconnect", () => {
        wsServer.sockets.emit("room_change", publicRooms());
    })

    // message
    socket.on("new_message", (msg, room, done) => {
        socket.to(room).emit("new_message", `${socket.nickname} : ${msg}`);
        done();
    });

    socket.on("nickname", (nickname) => (socket["nickname"] = nickname));
});


function onSocketClose() {
    console.log("Disconnected from the Browser")
}

/*
const wss = new WebSocket.Server({ server });
const sockets = [];
wss.on("connection", (socket) => {
    sockets.push(socket);
    socket["nickname"] = "Anon";
    console.log("Connected to Browser");

    socket.on("close", onSocketClose);

    socket.on("message", (msg) => {
        const message = JSON.parse(msg);
        console.log(socket.nickname);
        console.log(`message: ${message.type} ${message.payload}`);
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
*/

httpServer.listen(3000, handleListen);