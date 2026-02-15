import { io } from "socket.io-client";

export const socket = io(import.meta.env.VITE_API_URL, {
  autoConnect: false,
});

export const connectSocket = () => {
  const token = localStorage.getItem("token"); // <-- EXACT MATCH

  if (!token) return console.log("No socket token");

  socket.auth = { token };
  socket.connect();
};
