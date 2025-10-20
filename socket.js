// Socket.IO helper functions for emitting events from controllers

let io = null;

// Initialize Socket.IO instance
exports.init = (socketIo) => {
  io = socketIo;
  console.log("Socket.IO initialized in socket helper");
};

// Get Socket.IO instance
exports.getIO = () => {
  if (!io) {
    throw new Error("Socket.IO not initialized");
  }
  return io;
};

// Emit notification to specific user
exports.emitNotification = (userId, notification) => {
  if (io) {
    io.to(`user-${userId}`).emit("notification", notification);
  }
};

// Emit to specific room
exports.emitToRoom = (room, event, data) => {
  if (io) {
    io.to(room).emit(event, data);
  }
};

// Emit to role-specific room
exports.emitToRole = (role, event, data) => {
  if (io) {
    io.to(`role-${role}`).emit(event, data);
  }
};

// Emit booking update
exports.emitBookingUpdate = (bookingId, data) => {
  if (io) {
    io.to(`booking-${bookingId}`).emit("booking-updated", data);
  }
};

// Emit order update
exports.emitOrderUpdate = (orderId, data) => {
  if (io) {
    io.to(`order-${orderId}`).emit("order-updated", data);
  }
};
