import { io } from "socket.io-client";

// Creates a fresh socket connection, sending our login token along
// so the server can verify who we are.
const socket = io(import.meta.env.VITE_SOCKET_URL, {
  autoConnect: false,
});

export default socket;