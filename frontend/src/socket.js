import { io } from "socket.io-client";

// Creates a new socket connection for each editor instance.
export function createSocket() {
  const token = localStorage.getItem("token");

  return io(import.meta.env.VITE_SOCKET_URL, {
    autoConnect: false,
    auth: {
      token,
    },
  });
}