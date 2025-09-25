import express from 'express';
import { createServer } from 'http';
import { StatusCodes } from 'http-status-codes';
import { Server } from 'socket.io';

import bullServerAdapter from './config/bullBoardConfig.js';
import connectDB from './config/dbConfig.js';
import { PORT } from './config/serverConfig.js';
import ChannelSocketHandlers from './controllers/channelSocketController.js';
import MessageSocketHandlers from './controllers/messageSocketController.js';
import apiRouter from './routes/apiRouter.js';

const app = express();
const server = createServer(app);
const io = new Server(server);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', apiRouter);

app.use('/ui', bullServerAdapter.getRouter());

app.get('/', (req, res) => {
  res.status(StatusCodes.OK).json({
    message: 'Welcome to the Slack Clone API'
  });
});

io.on('connection', (socket) => {
  // console.log('a user connected = ', socket.id);

  // setInterval(() => {
  //   io.emit('message', `'Hello from the server' = ${Math.random()}`);
  // }, 3000);
  // socket.on('messageFromClient', (data) => {
  //   console.log('message from client = ', data);

  //   io.emit('new message', data.toUpperCase());
  // });
  MessageSocketHandlers(io, socket);
  ChannelSocketHandlers(io, socket);
});

server.listen(PORT, async () => {
  console.log(`🚀 Server is up and running at: http://localhost:${PORT}`);
  connectDB();
});
