import bcrypt from 'bcrypt';
import { StatusCodes } from 'http-status-codes';

import userRepository from '../repositories/userRepository.js';
import { createJWT } from '../utils/common/authUtils.js';
import ClientError from '../utils/errors/clientError.js';
import ValidationError from '../utils/errors/validationError.js';

export const signUpService = async (data) => {
  try {
    const newUser = await userRepository.create(data);
    return newUser;
  } catch (error) {
    console.error('User controller error', error);

    // ✅ Handle schema validation errors (e.g. required, minlength, regex)
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);

      throw new ValidationError({ error: messages }, 'Validation failed');
    }

    // ✅ Handle duplicate key errors (unique constraints)
    if (error?.code === 11000 || error?.cause?.code === 11000) {
      const keyPattern = error.keyPattern || error.cause?.keyPattern || {};
      const field = Object.keys(keyPattern)[0] || 'field';

      throw new ValidationError(
        { error: [`${field} already exists`] },
        `${field} already exists`
      );
    }

    // ❌ Unknown errors → let global error handler return 500
    throw error;
  }
};

export const signInService = async (data) => {
  try {
    const user = await userRepository.getByEmail(data.email);
    if (!user) {
      throw new ClientError({
        explanation: 'Invalid data sent from the client',
        message: 'No registered user found with this email',
        statusCode: StatusCodes.NOT_FOUND
      });
    }

    // match the incoming password with the hashed password
    const isMatch = bcrypt.compareSync(data.password, user.password);

    if (!isMatch) {
      throw new ClientError({
        explanation: 'Invalid data sent from the client',
        message: 'Invalid password, please try again',
        statusCode: StatusCodes.BAD_REQUEST
      });
    }

    return {
      username: user.username,
      avatar: user.avatar,
      email: user.email,
      _id: user._id,
      token: createJWT({ id: user._id, email: user.email })
    };
  } catch (error) {
    console.error('User service error', error);
    throw error;
  }
};
