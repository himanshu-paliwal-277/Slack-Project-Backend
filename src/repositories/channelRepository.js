import Channel from '../schema/channel.js';
import crudRepository from './crudRepository.js';

const channelRepository = {
  ...crudRepository(Channel),
  getChannelWithWorkspaceDetails: async function (channelId) {
    const channel = await Channel.findById(channelId).populate({
      path: 'workspaceId',
      populate: {
        path: 'members.memberId',
        select: 'userName email avatar'
      }
    });
    return channel;
  }
};

export default channelRepository;
