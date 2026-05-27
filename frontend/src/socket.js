import { io } from "socket.io-client";

export const socket = io(import.meta.env.VITE_API_URL, {
  autoConnect: false,
  transports: ["websocket"],   
  withCredentials: true        
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
