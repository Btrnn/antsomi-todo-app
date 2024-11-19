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
  },
});

// Socket.IO events
socketIO.on('connection', (socket) => {
  const token = socket.handshake.headers['authorization'];
  // socket.on('message', (message) => {
  //   console.log('Received message:', message); // Log the message received from frontend
  //   // You can emit the message back or perform other actions

  //   socket.broadcast.emit('message', message);

  //   //socketIO.emit('message_response', `Message received: ${message}`); // Emit back a response
  // });

  socket.on('comment-sent', (comment) => {
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
