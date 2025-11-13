import { StatusCodes } from 'http-status-codes';

import {
  getAllDMsService,
  getDMByIdService,
  sendDMMessageService,
  startDMService
} from '../services/dmService.js';
import {
  customErrorResponse,
  internalErrorResponse,
  successResponse
} from '../utils/common/responseObjects.js';

// Start or get existing DM
export const startDMController = async (req, res) => {
  try {
    const { recipientId, workspaceId } = req.body;
    const userId = req.user;

    // Validate required fields
    if (!recipientId || !workspaceId) {
      return res.status(StatusCodes.BAD_REQUEST).json(
        customErrorResponse({
          message: 'Recipient ID and Workspace ID are required',
          explanation: 'Missing required fields',
          statusCode: StatusCodes.BAD_REQUEST
        })
      );
    }

    const response = await startDMService(userId, recipientId, workspaceId);

    const message = response.isNew
      ? 'DM created successfully'
      : 'DM already exists';
    const statusCode = response.isNew ? StatusCodes.CREATED : StatusCodes.OK;

    return res.status(statusCode).json(successResponse(response.room, message));
  } catch (error) {
    console.error('Start DM controller error', error);

    if (error.statusCode) {
      return res.status(error.statusCode).json(customErrorResponse(error));
    }

    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(internalErrorResponse(error));
  }
};

// Get all DMs for a user in a workspace
export const getAllDMsController = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const userId = req.user;

    if (!workspaceId) {
      return res.status(StatusCodes.BAD_REQUEST).json(
        customErrorResponse({
          message: 'Workspace ID is required',
          explanation: 'Missing required parameter',
          statusCode: StatusCodes.BAD_REQUEST
        })
      );
    }

    const rooms = await getAllDMsService(userId, workspaceId);

    return res
      .status(StatusCodes.OK)
      .json(successResponse(rooms, 'DMs fetched successfully'));
  } catch (error) {
    console.error('Get all DMs controller error', error);

    if (error.statusCode) {
      return res.status(error.statusCode).json(customErrorResponse(error));
    }

    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(internalErrorResponse(error));
  }
};

// Get DM by ID with messages
export const getDMByIdController = async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user;

    if (!roomId) {
      return res.status(StatusCodes.BAD_REQUEST).json(
        customErrorResponse({
          message: 'Room ID is required',
          explanation: 'Missing required parameter',
          statusCode: StatusCodes.BAD_REQUEST
        })
      );
    }

    const response = await getDMByIdService(roomId, userId);

    return res
      .status(StatusCodes.OK)
      .json(successResponse(response, 'DM fetched successfully'));
  } catch (error) {
    console.error('Get DM by ID controller error', error);

    if (error.statusCode) {
      return res.status(error.statusCode).json(customErrorResponse(error));
    }

    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(internalErrorResponse(error));
  }
};

// Send message in DM
export const sendDMMessageController = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { body, image } = req.body;
    const userId = req.user;

    if (!roomId) {
      return res.status(StatusCodes.BAD_REQUEST).json(
        customErrorResponse({
          message: 'Room ID is required',
          explanation: 'Missing required parameter',
          statusCode: StatusCodes.BAD_REQUEST
        })
      );
    }

    if (!body) {
      return res.status(StatusCodes.BAD_REQUEST).json(
        customErrorResponse({
          message: 'Message body is required',
          explanation: 'Missing required field',
          statusCode: StatusCodes.BAD_REQUEST
        })
      );
    }

    const message = await sendDMMessageService(roomId, userId, body, image);

    return res
      .status(StatusCodes.CREATED)
      .json(successResponse(message, 'Message sent successfully'));
  } catch (error) {
    console.error('Send DM message controller error', error);

    if (error.statusCode) {
      return res.status(error.statusCode).json(customErrorResponse(error));
    }

    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(internalErrorResponse(error));
  }
};
