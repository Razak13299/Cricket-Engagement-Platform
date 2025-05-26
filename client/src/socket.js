import { io } from 'socket.io-client';

const socket = io('https://cricket-backend-uswr.onrender.com', {
  withCredentials: true,
  transports: ['websocket'],
});

export default socket;
