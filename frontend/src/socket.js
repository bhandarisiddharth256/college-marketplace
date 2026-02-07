import { io } from "socket.io-client";

export const socket = io("https://college-marketplace-k69b.onrender.com", {
  autoConnect: false,
});

export const connectSocket = () => {
  const token = localStorage.getItem("token");

  socket.auth = { token };
  socket.connect();
};
