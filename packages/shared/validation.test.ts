import { describe, expect, it } from "vitest";
import { validateContactMessage } from "./validation";

describe("validateContactMessage", () => {
  it("accepts valid contact message data", () => {
    const result = validateContactMessage({
      name: "Jane Doe",
      org: "Command Connect",
      email: "jane.doe@example.com",
      message: "Hello, I would like to learn more about your services.",
    });

    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("rejects invalid input with multiple validation errors", () => {
    const result = validateContactMessage({
      name: "J",
      org: "",
      email: "not-an-email",
      message: "short",
    });

    expect(result.isValid).toBe(false);
    expect(result.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: "name" }),
        expect.objectContaining({ field: "org" }),
        expect.objectContaining({ field: "email" }),
        expect.objectContaining({ field: "message" }),
      ]),
    );
  });
});
