import { io } from "socket.io-client";

// Create a socket connection for the editor.
export function createSocket() {
  const token = localStorage.getItem("token");

  return io(import.meta.env.VITE_SOCKET_URL, {
    autoConnect: false,
    auth: {
      token,
    },
  });
}