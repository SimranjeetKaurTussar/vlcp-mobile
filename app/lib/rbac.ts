import type { OrderStatus, UserRole } from "./storage";

const statusProgression: OrderStatus[] = [
  "Pending",
  "Accepted",
  "PACKED",
  "READY_FOR_PICKUP",
  "DISPATCHED",
  "PICKED_UP",
  "OUT_FOR_DELIVERY",
  "Delivered",
  "DELIVERED",
];

const roleAllowedTargets: Record<UserRole, OrderStatus[]> = {
  customer: [],
  seller: ["Accepted", "PACKED", "READY_FOR_PICKUP"],
  godown: ["DISPATCHED"],
  delivery: ["PICKED_UP", "OUT_FOR_DELIVERY", "Delivered", "DELIVERED"],
  admin: statusProgression,
};

export function normalizeDelivered(status: OrderStatus): OrderStatus {
  if (status === "DELIVERED") {
    return "Delivered";
  }

  return status;
}

export function canUpdateOrderStatus(role: UserRole, target: OrderStatus) {
  return roleAllowedTargets[role].includes(target);
}

