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

function canUpdateOrderStatus(role, status) {
  return (roleStatusPermissions[role] || []).includes(status);
}

module.exports = { canUpdateOrderStatus };
