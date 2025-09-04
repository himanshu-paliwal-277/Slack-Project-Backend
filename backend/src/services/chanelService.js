import { StatusCodes } from 'http-status-codes';

import channelRepository from '../repositories/channelRepository.js';
import ClientError from '../utils/errors/clientError.js';

export const getChannelByIdService = async (channelId) => {
  try {
    const channel = await channelRepository.getById(channelId);
    if (!channel) {
      throw new ClientError({
        message: 'channel not found',
        explanation: 'channel not found',
        status: StatusCodes.NOT_FOUND
      });
    }
    return channel;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
