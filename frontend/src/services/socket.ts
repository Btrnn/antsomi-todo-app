import { Cookies } from 'react-cookie';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:4000';

const cookies = new Cookies();
const value = cookies.get('authToken');

export const socket: Socket = io(SOCKET_URL, {
  autoConnect: true,
  transports: ['websocket'],
  extraHeaders: { Authorization: `Bearer ${value}` },
});
