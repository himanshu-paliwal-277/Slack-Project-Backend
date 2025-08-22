import User from '../schema/user.js';
import crudRepository from './crudRepository.js';

const userRepository = {
  ...crudRepository(User),
  getUserByEmail: async (email) => {
    const user = await User.findOne({ email: email });
    return user;
  },
  getUserByName: async (name) => {
    const user = await User.findOne({ userName: name });
    return user;
  }
};

export default userRepository;
