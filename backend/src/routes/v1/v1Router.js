import express from 'express';

import channelRouter from './channels.js';
import userRouter from './users.js';
import workspaceRouter from './workspace.js';

const router = express.Router();

router.use('/users', userRouter);
router.use('/workspaces', workspaceRouter);
router.use('/channels', channelRouter);

export default router;
