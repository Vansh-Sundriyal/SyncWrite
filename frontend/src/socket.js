import { io } from "socket.io-client";

// Creates a fresh socket connection, sending our login token along
// so the server can verify who we are.
export function createSocket() {
  const token = localStorage.getItem("token");

  return io("http://localhost:5000", {
    auth: { token },
  });
}
