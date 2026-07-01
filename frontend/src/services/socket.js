import { io } from 'socket.io-client';

const SOCKET_URL = 'https://ai-task-manager-j6az.onrender.com';

let socket = null;

// Returns a single shared socket connection, authenticated with the
// current access token. Call this once you know the user is logged in.
export const getSocket = () => {
  const token = localStorage.getItem('accessToken');

  if (!socket) {
    socket = io(SOCKET_URL, {
      auth: { token },
      autoConnect: false,
      withCredentials: true
    });
  } else {
    // Keep the token fresh in case it was refreshed since the socket was created
    socket.auth = { token };
  }

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
