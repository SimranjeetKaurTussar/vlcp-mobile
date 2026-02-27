const roleStatusPermissions = {
  customer: [],
  seller: ["ACCEPTED", "PACKED", "READY_FOR_PICKUP"],
  godown: ["DISPATCHED"],
  delivery: ["PICKED_UP", "OUT_FOR_DELIVERY", "DELIVERED"],
  admin: [
    "PENDING",
    "ACCEPTED",
    "PACKED",
    "READY_FOR_PICKUP",
    "DISPATCHED",
    "PICKED_UP",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
    "CANCELLED",
  ],
};

const statusSequence = {
  PENDING: ["ACCEPTED", "CANCELLED"],
  ACCEPTED: ["PACKED", "CANCELLED"],
  PACKED: ["READY_FOR_PICKUP", "CANCELLED"],
  READY_FOR_PICKUP: ["DISPATCHED", "CANCELLED"],
  DISPATCHED: ["PICKED_UP", "CANCELLED"],
  PICKED_UP: ["OUT_FOR_DELIVERY", "CANCELLED"],
  OUT_FOR_DELIVERY: ["DELIVERED", "CANCELLED"],
  DELIVERED: [],
  CANCELLED: [],
};

function canUpdateOrderStatus(role, currentStatus, nextStatus) {
  const allowedByRole = (roleStatusPermissions[role] || []).includes(nextStatus);
  const allowedBySequence = (statusSequence[currentStatus] || []).includes(nextStatus);
  return allowedByRole && allowedBySequence;
}

module.exports = { canUpdateOrderStatus };
