import type { OrderStatus, UserRole } from "./storage";

const ROLE_STATUS_PERMISSIONS: Record<UserRole, OrderStatus[]> = {
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
  ],
};

export function canUpdateOrderStatus(role: UserRole, status: OrderStatus) {
  return ROLE_STATUS_PERMISSIONS[role].includes(status);
}

export function getRoleAllowedStatuses(role: UserRole) {
  return ROLE_STATUS_PERMISSIONS[role];
}

export function canAssignDeliveryPartner(role: UserRole) {
  return role === "godown" || role === "admin";
}
