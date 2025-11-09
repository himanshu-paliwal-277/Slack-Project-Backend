import { createMessageService } from '../services/messageService.js';
import {
  NEW_MESSAGE_EVENT,
  NEW_MESSAGE_RECEIVED_EVENT
} from '../utils/common/eventConstants.js';

export default function messageHandlers(io, socket) {
  socket.on(NEW_MESSAGE_EVENT, async function createMessageHandler(data, cb) {
    const { roomId } = data;
    const messageResponse = await createMessageService(data);

    io.to(roomId).emit(NEW_MESSAGE_RECEIVED_EVENT, messageResponse);

    cb({
      success: true,
      message: 'Successfully created the message',
      data: messageResponse
    });
  });
}
