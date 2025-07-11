import { Server } from "socket.io";

let io;
const connectedUsers = {}; // store userId -> socketId

export const setupSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.ORIGINS,
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("register", (userId) => {
      connectedUsers[userId] = socket.id;
      console.log(`User registered: ${userId} -> ${socket.id}`);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
      for (const userId in connectedUsers) {
        if (connectedUsers[userId] === socket.id) {
          delete connectedUsers[userId];
          break;
        }
      }
    });
  });
};

// helper to emit event to specific user
export const emitToUser = (userId, event, data) => {
  const socketId = connectedUsers[userId];
  if (socketId && io) {
    io.to(socketId).emit(event, data);
  }
};

export { io, connectedUsers };
