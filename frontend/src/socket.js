import { io } from "socket.io-client";

export const socket = io(import.meta.env.VITE_API_URL, {
  autoConnect: false,
  transports: ["websocket"],   // 🔥 force websocket
  withCredentials: true        // 🔥 important for auth
});

export const connectSocket = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    console.log("No socket token");
    return;
  }

  socket.auth = { token };
  socket.connect();
};
