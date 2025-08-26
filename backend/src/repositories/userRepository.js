import User from '../schema/user.js';
import crudRepository from './crudRepository.js';

const userRepository = {
  ...crudRepository(User),
  getByEmail: async (email) => {
    const user = await User.findOne({ email });
    return user;
  },
  getByName: async (userName) => {
    const user = await User.findOne({ userName }).select('-password'); // Exclude password from the result
    return user;
  }
};

export default userRepository;
