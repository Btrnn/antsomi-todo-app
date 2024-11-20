import { Request, Response } from 'express';
import * as express from 'express';
import * as http from 'http';
import * as cors from 'cors';
import { Server as SocketIOServer } from 'socket.io';

const app = express();
const PORT = 4000;

app.use(cors());
const server = http.createServer(app);

const socketIO = new SocketIOServer(server, {
  cors: {
    origin: 'http://localhost:3001',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Authorization'],
    credentials: true,
  },
});

// Socket.IO events
socketIO.on('connection', (socket) => {
  console.log('🚀 ~ socketIO.on ~ header:', socket.handshake.headers);
  const token = socket.handshake.headers['authorization'];
  console.log('🚀 ~ socketIO.on ~ token:', token);
  socket.on('comment-sent', (comment) => {
    console.log('🚀 ~ socket.on ~ comment:', comment);
    socket.broadcast.emit('comment-received', comment);

    //socketIO.emit('message_response', `Message received: ${message}`); // Emit back a response
  });

  // Event for user disconnect
  socket.on('disconnect', () => {
    console.log('🔥: A user disconnected');
  });
});

app.get('/api', (req: Request, res: Response) => {
  res.json({
    message: 'Hello world',
  });
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
