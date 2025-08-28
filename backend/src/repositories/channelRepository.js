import Channel from '../schema/channel.js';
import crudRepository from './crudRepository.js';

const channelRepository = {
  ...crudRepository(Channel),
  getByName: async (channelName) => {
    const channel = await Channel.findOne({ name: channelName });
    return channel;
  }
};

export default channelRepository;
