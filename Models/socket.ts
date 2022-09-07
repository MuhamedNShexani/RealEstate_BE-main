import * as express from "express";
const app = express();
import * as http from "http";
import * as cors from "cors";

import { Server } from "socket.io";
// let updatedRoomName;

app.use(cors());

// let active=[];
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

//   socket.on("join_room", (data) => {
//     socket.join(data);
// //    console.log(`User with ID: ${socket.id} joined room: ${data}`);
//   });
 
  socket.on('join', room => {
     socket.join(room);})
  
//   socket.on("Actives", (data) => {
//    // d.push({username:data.username,room:data.room,id:socket.id})
//     let G=active.filter((i)=>i.username==data.username)
//   //  socket.emit("receive_id", G );
// if(G.length==0){
//   G=false
// }else G=true;
//     socket.emit("receive_Active", G );
//   })
//   socket.on("delete_message",(data)=>{
//     socket.to(data.room).emit("after_delete",data);
//   })
//   socket.on("update_message",(data)=>{
//     socket.to(data.room).emit("after_update",data.messageList);
//   })

//   socket.on("send_message", (data) => {
//     socket.join(data.room);
//     console.log("on send message :",data)
//         io.to(data.room).emit("receive_message",{...data,isSender:false});
//   });

  socket.on("disconnect", () => {
//     active=active.filter(i=>i.id!=socket.id)
//   //  console.log("User Disconnected", socket.id);
  });
});

server.listen(3001, () => {
  console.log("SERVER RUNNING 3001");
});