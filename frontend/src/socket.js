import { io } from "socket.io-client";

export const socket = io(import.meta.env.VITE_API_URL, {
  autoConnect: false,
  transports: ["websocket"],   
  withCredentials: true,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5,
});

export const connectSocket = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    console.log("❌ No socket token available");
    return;
  }

  // Avoid duplicate connections
  if (socket.connected) {
    console.log("✅ Socket already connected");
    return;
  }

  socket.auth = { token };
  socket.connect();

  // Handle reconnection errors
  socket.on("reconnect_error", (error) => {
    console.error("❌ Socket reconnection error:", error);
  });

  socket.on("disconnect", (reason) => {
    if (reason === "io server disconnect") {
      console.log("❌ Server disconnected socket, attempting to reconnect...");
      // Server disconnected, attempt manual reconnect after delay
      setTimeout(() => {
        socket.connect();
      }, 2000);
    }
  });
};
