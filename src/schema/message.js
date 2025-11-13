import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    body: {
      type: String,
      required: [true, 'Message body is required']
    },
    image: {
      type: String
    },
    channelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Channel'
    },
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room'
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Sender ID is required']
    },
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: [true, 'Workspace ID is required']
    }
  },
  {
    timestamps: true
  }
);

// Custom validation: Either channelId or roomId must be present
messageSchema.pre('validate', function (next) {
  if (!this.channelId && !this.roomId) {
    next(new Error('Either channelId or roomId must be provided'));
  } else if (this.channelId && this.roomId) {
    next(new Error('Cannot have both channelId and roomId'));
  } else {
    next();
  }
});

const Message = mongoose.model('Message', messageSchema);

export default Message;
