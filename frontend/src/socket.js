import { io } from "socket.io-client";

const token = localStorage.getItem("token"); // JWT

export const socket = io("https://college-marketplace-k69b.onrender.com/", {
  autoConnect: false,
  auth: {
    token, // 🔥 THIS IS THE KEY FIX
  },
});
