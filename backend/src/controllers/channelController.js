import { StatusCodes } from 'http-status-codes';

import { getChannelByIdService } from '../services/chanelService.js';
import {
  customErrorResponse,
  internalErrorResponse,
  successResponse
} from '../utils/common/responseObjects.js';

export const getChannelByIdController = async (req, res) => {
  const channelId = req.params.channelId;
  try {
    const channel = await getChannelByIdService(channelId);
    return res
      .status(StatusCodes.OK)
      .json(successResponse(channel, 'Channel fetched successfully'));
  } catch (error) {
    console.log('get channel controller error', error);
    if (error.statusCode) {
      return res.status(error.statusCode).json(customErrorResponse(error));
    }

    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(internalErrorResponse(error));
  }
};
