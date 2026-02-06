import { io } from "socket.io-client";

const token = localStorage.getItem("token"); // JWT

export const socket = io("http://localhost:5000", {
  autoConnect: false,
  auth: {
    token, // 🔥 THIS IS THE KEY FIX
  },
});
