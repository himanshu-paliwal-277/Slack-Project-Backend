import express from 'express';

import {
  getAllDMsController,
  getDMByIdController,
  sendDMMessageController,
  startDMController
} from '../../controllers/dmController.js';
import { isAuthenticated } from '../../middlewares/authMiddleware.js';

const router = express.Router();

// Start or get existing DM
router.post('/start', isAuthenticated, startDMController);

// Get all DMs for a user in a workspace
router.get('/workspace/:workspaceId', isAuthenticated, getAllDMsController);

// Get DM by ID with messages
router.get('/:roomId', isAuthenticated, getDMByIdController);

// Send message in DM
router.post('/:roomId/message', isAuthenticated, sendDMMessageController);

export default router;
