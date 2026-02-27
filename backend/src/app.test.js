const request = require("supertest");
const { app } = require("./app");
const { canUpdateOrderStatus } = require("./rbac");

describe("VLCP backend critical checks", () => {
  it("health endpoint works", async () => {
    const res = await request(app).get("/health");
    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  it("blocks protected routes without JWT", async () => {
    const res = await request(app).get("/users/me");
    expect(res.statusCode).toBe(401);
  });

  it("enforces role + sequence for status update", () => {
    expect(canUpdateOrderStatus("seller", "PENDING", "ACCEPTED")).toBe(true);
    expect(canUpdateOrderStatus("seller", "PENDING", "PACKED")).toBe(false);
    expect(canUpdateOrderStatus("delivery", "DISPATCHED", "PICKED_UP")).toBe(true);
    expect(canUpdateOrderStatus("customer", "PENDING", "ACCEPTED")).toBe(false);
  });
});
