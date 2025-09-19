import express from 'express';
import { StatusCodes } from 'http-status-codes';

import bullServerAdapter from './config/bullBoardConfig.js';
import connectDB from './config/dbConfig.js';
import { PORT } from './config/serverConfig.js';
import apiRouter from './routes/apiRouter.js';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', apiRouter);

app.use('/ui', bullServerAdapter.getRouter());

app.get('/', (req, res) => {
  res.status(StatusCodes.OK).json({
    message: 'Welcome to the Slack Clone API'
  });
});

app.listen(PORT, async () => {
  console.log(`🚀 Server is up and running at: http://localhost:${PORT}`);
  connectDB();
});
