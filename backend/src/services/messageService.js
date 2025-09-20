import messageRepository from '../repositories/messageRepository';

export const getMessagesService = async (messageParams, page, limit) => {
  const messages = await messageRepository.getPaginatedMessaged(
    messageParams,
    page,
    limit
  );
  return messages;
};
