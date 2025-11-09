import { StatusCodes } from 'http-status-codes';

import User from '../schema/user.js';
import Workspace from '../schema/workspace.js';
import ClientError from '../utils/errors/clientError.js';
import channelRepository from './channelRepository.js';
import crudRepository from './crudRepository.js';

const workspaceRepository = {
  ...crudRepository(Workspace),
  getWorkspaceDetailsById: async function (workspaceId) {
    const workspace = await Workspace.findById(workspaceId)
      .populate('members.memberId', 'userName email avatar')
      .populate('channels');

    return workspace;
  },
  getWorkspaceByName: async function (workspaceName) {
    const workspace = await Workspace.findOne({ name: workspaceName });

    if (!workspace) {
      throw new ClientError({
        explanation: 'Invalid data sent from the client',
        message: 'Workspace not found',
        statusCode: StatusCodes.NOT_FOUND
      });
    }
    return workspace;
  },
  getWorkspaceByJoinCode: async function (joinCode) {
    const workspace = await Workspace.findOne({ joinCode });

    if (!workspace) {
      throw new ClientError({
        explanation: 'Invalid data sent from the client',
        message: 'Workspace not found',
        statusCode: StatusCodes.NOT_FOUND
      });
    }
    return workspace;
  },
  addMemberToWorkspace: async function (workspaceId, memberId, role) {
    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) {
      throw new ClientError({
        explanation: 'Invalid data sent from the client',
        message: 'Workspace not found',
        statusCode: StatusCodes.NOT_FOUND
      });
    }

    const isValidUser = await User.findById(memberId);
    if (!isValidUser) {
      throw new ClientError({
        explanation: 'Invalid data sent from the client',
        message: 'User not found',
        statusCode: StatusCodes.NOT_FOUND
      });
    }

    const isMemberAlreadyPartOfWorkspace = workspace.members.find(
      (member) => member.memberId && member.memberId.toString() === memberId
    );

    if (isMemberAlreadyPartOfWorkspace) {
      throw new ClientError({
        explanation: 'Invalid data sent from the client',
        message: 'User is already a member of the workspace',
        statusCode: StatusCodes.CONFLICT
      });
    }

    workspace.members.push({ memberId, role });
    await workspace.save();

    return workspace;
  },
  addChannelToWorkspace: async function (workspaceId, channelName) {
    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) {
      throw new ClientError({
        explanation: 'Invalid data sent from the client',
        message: 'Workspace not found',
        statusCode: StatusCodes.NOT_FOUND
      });
    }

    const isChannelAlreadyPartOfWorkspace = workspace.channels.find(
      (channel) => channel.name === channelName
    );

    if (isChannelAlreadyPartOfWorkspace) {
      throw new ClientError({
        explanation: 'Invalid data sent from the client',
        message: 'Channel is already part of the workspace',
        statusCode: StatusCodes.CONFLICT
      });
    }

    const channel = await channelRepository.create({
      name: channelName,
      workspaceId: workspaceId
    });

    workspace.channels.push(channel);
    await workspace.save();

    return workspace;
  },
  fetchAllWorkspaceByMemberId: async function (memberId) {
    const workspaces = await Workspace.find({
      'members.memberId': memberId
    }).populate('members.memberId', 'userName email avatar');
    return workspaces;
  },
  getWorkspaceByChannelId: async function (channelId) {
    const workspace = await Workspace.findOne({
      channels: channelId
    }).populate('members.memberId', 'userName email avatar');
    return workspace;
  }
};

export default workspaceRepository;
