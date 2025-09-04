import express from 'express';

import { getChannelByIdController } from '../../controllers/channelController.js';

const router = express.Router();



router.get('/:channelId', getChannelByIdController);

export default router;
