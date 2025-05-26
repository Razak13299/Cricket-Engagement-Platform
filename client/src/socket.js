import { io } from 'socket.io-client';

const socket = io('https://<your-render-backend-url>', {
  withCredentials: true,
  transports: ['websocket'],
});

export default socket;
