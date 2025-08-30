import express from 'express';

import {
  addChannelToWorkspaceController,
  addMemberToWorkspaceController,
  createWorkspaceController,
  deleteWorkspaceController,
  getWorkspaceController,
  getWorkspacesUserIsMemberOfController,
  updateWorkspaceController
} from '../../controllers/workspaceController.js';
import { isAuthenticated } from '../../middlewares/authMiddleware.js';
import { createWorkspaceSchema } from '../../validators/workspaceSchema.js';
import { validate } from '../../validators/zodValidator.js';

const router = express.Router();

router.post(
  '/',
  isAuthenticated,
  validate(createWorkspaceSchema),
  createWorkspaceController
);

router.get('/', isAuthenticated, getWorkspacesUserIsMemberOfController);

router.delete('/:workspaceId', isAuthenticated, deleteWorkspaceController);

router.get('/:workspaceId', isAuthenticated, getWorkspaceController);

router.get('/:joinCode/join', getWorkspaceController);

router.post('/:workspaceId', isAuthenticated, updateWorkspaceController);

router.post('/:workspaceId', isAuthenticated, addMemberToWorkspaceController);

router.post(
  '/:workspaceId/channels',
  isAuthenticated,
  addChannelToWorkspaceController
);

export default router;
