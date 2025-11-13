import { StatusCodes } from 'http-status-codes';

import messageRepository from '../repositories/messageRepository.js';
import roomRepository from '../repositories/roomRepository.js';
import workspaceRepository from '../repositories/workspaceRepository.js';
import ClientError from '../utils/errors/clientError.js';
import { isUserMemberOfWorkspace } from './workspaceService.js';

// Start or get existing DM
export const startDMService = async (userId, recipientId, workspaceId) => {
  try {
    // Validate that workspace exists
    const workspace = await workspaceRepository.getById(workspaceId);

    if (!workspace) {
      throw new ClientError({
        message: 'Workspace not found with the provided ID',
        explanation: 'Invalid workspace ID sent from the client',
        statusCode: StatusCodes.NOT_FOUND
      });
    }

    // Validate that both users are members of the workspace
    const isUserMember = isUserMemberOfWorkspace(workspace, userId);
    const isRecipientMember = isUserMemberOfWorkspace(workspace, recipientId);

    if (!isUserMember) {
      throw new ClientError({
        message: 'You are not a member of this workspace',
        explanation: 'User is not authorized to create DM in this workspace',
        statusCode: StatusCodes.UNAUTHORIZED
      });
    }

    if (!isRecipientMember) {
      throw new ClientError({
        message: 'Recipient is not a member of this workspace',
        explanation: 'Cannot create DM with user who is not in the workspace',
        statusCode: StatusCodes.BAD_REQUEST
      });
    }

    // Validate that user is not trying to DM themselves
    if (userId === recipientId) {
      throw new ClientError({
        message: 'Cannot create DM with yourself',
        explanation: 'Invalid recipient ID',
        statusCode: StatusCodes.BAD_REQUEST
      });
    }

    // Check if DM room already exists
    const existingRoom = await roomRepository.findExistingRoom(
      userId,
      recipientId,
      workspaceId
    );

    if (existingRoom) {
      return {
        room: existingRoom,
        isNew: false
      };
    }

    // Create new DM room
    const newRoom = await roomRepository.createRoom(
      userId,
      recipientId,
      workspaceId
    );

    // Fetch the room with populated details
    const roomWithDetails = await roomRepository.getRoomWithDetails(
      newRoom._id
    );

    return {
      room: roomWithDetails,
      isNew: true
    };
  } catch (error) {
    console.error('Start DM service error', error);
    throw error;
  }
};

// Get all DMs for a user in a workspace
export const getAllDMsService = async (userId, workspaceId) => {
  try {
    // Validate that workspace exists
    const workspace = await workspaceRepository.getById(workspaceId);

    if (!workspace) {
      throw new ClientError({
        message: 'Workspace not found with the provided ID',
        explanation: 'Invalid workspace ID sent from the client',
        statusCode: StatusCodes.NOT_FOUND
      });
    }

    // Validate that user is member of the workspace
    const isUserMember = isUserMemberOfWorkspace(workspace, userId);

    if (!isUserMember) {
      throw new ClientError({
        message: 'You are not a member of this workspace',
        explanation: 'User is not authorized to access DMs in this workspace',
        statusCode: StatusCodes.UNAUTHORIZED
      });
    }

    // Get all rooms for the user
    const rooms = await roomRepository.getAllRoomsForUser(userId, workspaceId);

    return rooms;
  } catch (error) {
    console.error('Get all DMs service error', error);
    throw error;
  }
};

// Get DM by ID with messages
export const getDMByIdService = async (roomId, userId) => {
  try {
    // Check if room exists
    const room = await roomRepository.getRoomWithDetails(roomId);

    if (!room) {
      throw new ClientError({
        message: 'DM room not found with the provided ID',
        explanation: 'Invalid room ID sent from the client',
        statusCode: StatusCodes.NOT_FOUND
      });
    }

    // Check if user is member of the room
    const isMember = room.members.some(
      (member) => member._id.toString() === userId
    );

    if (!isMember) {
      throw new ClientError({
        message: 'You are not a member of this DM',
        explanation: 'User is not authorized to access this DM',
        statusCode: StatusCodes.UNAUTHORIZED
      });
    }

    // Get messages for the room
    const messages = await messageRepository.getPaginatedMessaged(
      { roomId },
      1,
      50
    );

    return {
      room,
      messages
    };
  } catch (error) {
    console.error('Get DM by ID service error', error);
    throw error;
  }
};

// Send message in DM
export const sendDMMessageService = async (
  roomId,
  userId,
  messageBody,
  image
) => {
  try {
    // Check if room exists and user is member
    const room = await roomRepository.getById(roomId);

    if (!room) {
      throw new ClientError({
        message: 'DM room not found with the provided ID',
        explanation: 'Invalid room ID sent from the client',
        statusCode: StatusCodes.NOT_FOUND
      });
    }

    // Check if user is member of the room
    const isMember = room.members.some(
      (member) => member.toString() === userId
    );

    if (!isMember) {
      throw new ClientError({
        message: 'You are not a member of this DM',
        explanation: 'User is not authorized to send messages in this DM',
        statusCode: StatusCodes.UNAUTHORIZED
      });
    }

    // Create message
    const messageData = {
      body: messageBody,
      roomId: roomId,
      senderId: userId,
      workspaceId: room.workspaceId
    };

    if (image) {
      messageData.image = image;
    }

    const message = await messageRepository.create(messageData);

    // Update room's last message
    await roomRepository.updateLastMessage(roomId, message._id);

    // Populate sender details
    const populatedMessage = await messageRepository.getById(message._id);
    await populatedMessage.populate('senderId', 'userName email avatar');

    return populatedMessage;
  } catch (error) {
    console.error('Send DM message service error', error);
    throw error;
  }
};
