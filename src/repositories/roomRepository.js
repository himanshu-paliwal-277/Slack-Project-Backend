import Room from '../schema/room.js';
import crudRepository from './crudRepository.js';

const roomRepository = {
  ...crudRepository(Room),

  // Find existing DM room between two users in a workspace
  findExistingRoom: async function (userId, recipientId, workspaceId) {
    const room = await Room.findOne({
      workspaceId,
      members: { $all: [userId, recipientId], $size: 2 }
    })
      .populate('members', 'userName email avatar')
      .populate('lastMessage');

    return room;
  },

  // Create new DM room
  createRoom: async function (userId, recipientId, workspaceId) {
    const room = await Room.create({
      name: `DM_${userId}_${recipientId}`,
      members: [userId, recipientId],
      createdBy: userId,
      workspaceId: workspaceId
    });

    return room;
  },

  // Get room with all details (members populated)
  getRoomWithDetails: async function (roomId) {
    const room = await Room.findById(roomId)
      .populate('members', 'userName email avatar')
      .populate('lastMessage')
      .populate('workspaceId', 'name');

    return room;
  },

  // Get all rooms for a user in a workspace
  getAllRoomsForUser: async function (userId, workspaceId) {
    const rooms = await Room.find({
      workspaceId,
      members: userId
    })
      .populate('members', 'userName email avatar')
      .populate('lastMessage')
      .sort({ lastMessageAt: -1, updatedAt: -1 });

    return rooms;
  },

  // Update last message in room
  updateLastMessage: async function (roomId, messageId) {
    const room = await Room.findByIdAndUpdate(
      roomId,
      {
        lastMessage: messageId,
        lastMessageAt: new Date()
      },
      { new: true }
    );

    return room;
  },

  // Check if user is member of room
  isUserMemberOfRoom: async function (roomId, userId) {
    const room = await Room.findOne({
      _id: roomId,
      members: userId
    });

    return !!room;
  }
};

export default roomRepository;
