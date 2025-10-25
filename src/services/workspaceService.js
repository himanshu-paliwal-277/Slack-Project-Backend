import { StatusCodes } from 'http-status-codes';
import { v4 as uuidv4 } from 'uuid';

import { addEmailToMailQueue } from '../processors/mailQueueProducer.js';
import channelRepository from '../repositories/channelRepository.js';
import userRepository from '../repositories/userRepository.js';
import workspaceRepository from '../repositories/workspaceRepository.js';
import { workspaceJoinMail } from '../utils/common/mailObject.js';
import ClientError from '../utils/errors/clientError.js';
import ValidationError from '../utils/errors/validationError.js';

const isUserAdminOfWorkspace = (workspace, userId) => {
  const response = workspace.members.find(
    (member) =>
      (member.memberId.toString() === userId ||
        member.memberId._id.toString() === userId) &&
      member.role === 'admin'
  );
  return response;
};

export const isUserMemberOfWorkspace = (workspace, userId) => {
  return workspace.members.find((member) => {
    console.log('member id ', member.memberId.toString());
    return member.memberId._id.toString() === userId;
  });
};

const isChannelAlreadyPartOfWorkspace = (workspace, channelName) => {
  return workspace.channels.find(
    (channel) => channel.name.toLowerCase() === channelName.toLowerCase()
  );
};

export const createWorkspaceService = async (workspaceData) => {
  try {
    const joinCode = uuidv4().substring(0, 6).toUpperCase();

    const response = await workspaceRepository.create({
      name: workspaceData.name,
      description: workspaceData.description,
      joinCode
    });

    await workspaceRepository.addMemberToWorkspace(
      response._id,
      workspaceData.owner,
      'admin'
    );

    const updateWorkspace = await workspaceRepository.addChannelToWorkspace(
      response._id,
      'general'
    );

    console.log('workspace data = ', workspaceData.owner);
    console.log('workspace name = ', workspaceData.name);

    return updateWorkspace;
  } catch (error) {
    console.error('Error creating workspace:', error);

    // ✅ Handle validation errors (from Mongoose schema)
    if (error.name === 'ValidationError') {
      throw new ValidationError(
        {
          error: Object.values(error.errors).map((err) => err.message)
        },
        error.message
      );
    }

    // ✅ Handle duplicate key errors (unique constraints)
    if (error.name === 'MongoServerError' && error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0]; // e.g. "workspaceName"
      throw new ValidationError(
        {
          error: [`${field} already exists`]
        },
        `${field} already exists`
      );
    }

    // ✅ Re-throw unhandled errors
    throw error;
  }
};

export const getWorkspacesUserIsMemberOfService = async (userId) => {
  try {
    const response =
      await workspaceRepository.fetchAllWorkspaceByMemberId(userId);
    return response;
  } catch (error) {
    console.error('Get workspaces user is member of service error', error);
    throw error;
  }
};

export const deleteWorkspaceService = async (workspaceId, userId) => {
  try {
    const workspace = await workspaceRepository.getById(workspaceId);
    if (!workspace) {
      throw new ClientError({
        explanation: 'Invalid data sent from the client',
        message: 'Workspace not found',
        statusCode: StatusCodes.NOT_FOUND
      });
    }
    const isAllowed = workspace.members.find(
      (member) =>
        member.memberId.toString() === userId && member.role === 'admin'
    );

    if (isAllowed) {
      await channelRepository.deleteMany(workspace.channels);

      const response = await workspaceRepository.delete(workspaceId);
      return response;
    }
    throw new ClientError({
      explanation: 'User is either not a memeber or an admin of the workspace',
      message: 'User is not allowed to delete the workspace',
      statusCode: StatusCodes.UNAUTHORIZED
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getWorkspaceService = async (workspaceId, userId) => {
  try {
    console.log('workspaceId =', workspaceId, ' userId =', userId);
    const workspace =
      await workspaceRepository.getWorkspaceDetailsById(workspaceId);
    if (!workspace) {
      throw new ClientError({
        explanation: 'Invalid data sent from the client',
        message: 'Workspace not found',
        statusCode: StatusCodes.NOT_FOUND
      });
    }
    console.log('workspace fetched =', workspace);
    const isMember = isUserMemberOfWorkspace(workspace, userId);
    if (!isMember) {
      throw new ClientError({
        explanation: 'User is not a member of the workspace',
        message: 'User is not a member of the workspace',
        statusCode: StatusCodes.UNAUTHORIZED
      });
    }
    return workspace;
  } catch (error) {
    console.error('Get workspace service error', error);
    throw error;
  }
};

export const getWorkspaceByJoinCodeService = async (joinCode, userId) => {
  try {
    const workspace =
      await workspaceRepository.getWorkspaceByJoinCode(joinCode);
    if (!workspace) {
      throw new ClientError({
        explanation: 'Invalid data sent from the client',
        message: 'Workspace not found',
        statusCode: StatusCodes.NOT_FOUND
      });
    }
    const isMember = isUserMemberOfWorkspace(workspace, userId);
    if (!isMember) {
      throw new ClientError({
        explanation: 'User is not a member of the workspace',
        message: 'User is not a member of the workspace',
        statusCode: StatusCodes.UNAUTHORIZED
      });
    }
    return workspace;
  } catch (error) {
    console.error('Get workspace by join code service error', error);
    throw error;
  }
};

export const updateWorkspaceService = async (
  workspaceId,
  workspaceData,
  userId
) => {
  try {
    const workspace = await workspaceRepository.getById(workspaceId);
    if (!workspace) {
      throw new ClientError({
        explanation: 'Invalid data sent from the client',
        message: 'Workspace not found',
        statusCode: StatusCodes.NOT_FOUND
      });
    }
    const isAdmin = isUserAdminOfWorkspace(workspace, userId);
    if (!isAdmin) {
      throw new ClientError({
        explanation: 'User is not an admin of the workspace',
        message: 'User is not an admin of the workspace',
        statusCode: StatusCodes.UNAUTHORIZED
      });
    }
    const updatedWorkspace = await workspaceRepository.update(
      workspaceId,
      workspaceData
    );
    return updatedWorkspace;
  } catch (error) {
    console.error('update workspace service error', error);
    throw error;
  }
};

export const addMemberToWorkspaceService = async (
  workspaceId,
  memberId,
  role,
  userId
) => {
  try {
    const workspace = await workspaceRepository.getById(workspaceId);
    if (!workspace) {
      throw new ClientError({
        explanation: 'Invalid data sent from the client',
        message: 'Workspace not found',
        statusCode: StatusCodes.NOT_FOUND
      });
    }
    const isAdmin = isUserAdminOfWorkspace(workspace, userId);
    if (!isAdmin) {
      throw new ClientError({
        explanation: 'User is not an admin of the workspace',
        message: 'User is not an admin of the workspace',
        statusCode: StatusCodes.UNAUTHORIZED
      });
    }
    const isValidUser = await userRepository.getById(memberId);
    if (!isValidUser) {
      throw new ClientError({
        explanation: 'Invalid data sent from the client',
        message: 'User not found',
        statusCode: StatusCodes.NOT_FOUND
      });
    }
    const isMember = isUserMemberOfWorkspace(workspace, memberId);
    if (isMember) {
      throw new ClientError({
        explanation: 'User is already a member of the workspace',
        message: 'User is already a member of the workspace',
        statusCode: StatusCodes.UNAUTHORIZED
      });
    }
    const response = await workspaceRepository.addMemberToWorkspace(
      workspaceId,
      memberId,
      role
    );

    console.log('user email = ', isValidUser.email);

    addEmailToMailQueue({
      ...workspaceJoinMail(workspace),
      to: isValidUser.email
    });

    return response;
  } catch (error) {
    console.error('addMemberToWorkspaceService error', error);
    throw error;
  }
};

export const addChannelToWorkspaceService = async (
  workspaceId,
  channelName,
  userId
) => {
  try {
    const workspace =
      await workspaceRepository.getWorkspaceDetailsById(workspaceId);
    if (!workspace) {
      throw new ClientError({
        explanation: 'Invalid data sent from the client',
        message: 'Workspace not found',
        statusCode: StatusCodes.NOT_FOUND
      });
    }
    const isAdmin = isUserAdminOfWorkspace(workspace, userId);
    if (!isAdmin) {
      throw new ClientError({
        explanation: 'User is not an admin of the workspace',
        message: 'User is not an admin of the workspace',
        statusCode: StatusCodes.UNAUTHORIZED
      });
    }
    const isChannelPartOfWorkspace = isChannelAlreadyPartOfWorkspace(
      workspace,
      channelName
    );
    if (isChannelPartOfWorkspace) {
      throw new ClientError({
        explanation: 'Invalid data sent from the client',
        message: 'Channel already part of workspace',
        statusCode: StatusCodes.FORBIDDEN
      });
    }
    const response = await workspaceRepository.addChannelToWorkspace(
      workspaceId,
      channelName
    );

    return response;
  } catch (error) {
    console.error('addChannelToWorkspaceService error', error);
    throw error;
  }
};

export const getWorkspaceByChannelIdAndCheckIsUserPartOfWorkspaceService =
  async (channelId, userId) => {
    try {
      const workspace =
        await workspaceRepository.getWorkspaceByChannelId(channelId);
      if (!workspace) {
        throw new ClientError({
          explanation: 'Invalid data sent from the client',
          message: 'Workspace not found',
          statusCode: StatusCodes.NOT_FOUND
        });
      }
      const isMember = isUserMemberOfWorkspace(workspace, userId);
      if (!isMember) {
        throw new ClientError({
          explanation: 'User is not a member of the workspace',
          message: 'User is not a member of the workspace',
          statusCode: StatusCodes.UNAUTHORIZED
        });
      }
      return workspace;
    } catch (error) {
      console.error(
        'getWorkspaceByChannelIdAndCheckIsUserPartOfWorkspace error',
        error
      );
      throw error;
    }
  };

export const resetWorkspaceJoinCodeService = async (workspaceId, userId) => {
  try {
    const newJoinCode = uuidv4().substring(0, 6).toUpperCase();
    const updatedWorkspace = await updateWorkspaceService(
      workspaceId,
      {
        joinCode: newJoinCode
      },
      userId
    );
    return updatedWorkspace;
  } catch (error) {
    console.log('resetWorkspaceJoinCodeService error', error);
    throw error;
  }
};

export const joinWorkspaceService = async (workspaceId, joinCode, userId) => {
  try {
    const workspace =
      await workspaceRepository.getWorkspaceDetailsById(workspaceId);
    if (!workspace) {
      throw new ClientError({
        explanation: 'Invalid data sent from the client',
        message: 'Workspace not found',
        statusCode: StatusCodes.NOT_FOUND
      });
    }

    if (workspace.joinCode !== joinCode) {
      throw new ClientError({
        explanation: 'Invalid data sent from the client',
        message: 'Invalid join code',
        statusCode: StatusCodes.BAD_REQUEST
      });
    }

    const isMember = isUserMemberOfWorkspace(workspace, userId);
    if (isMember) {
      throw new ClientError({
        explanation: 'User is already a member of the workspace',
        message: 'User is already a member of the workspace',
        statusCode: StatusCodes.BAD_REQUEST
      });
    }

    const updatedWorkspace = await workspaceRepository.addMemberToWorkspace(
      workspaceId,
      userId,
      'member'
    );

    return updatedWorkspace;
  } catch (error) {
    console.log('joinWorkspaceService error', error);
    throw error;
  }
};
