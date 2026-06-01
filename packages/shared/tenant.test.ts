import { describe, expect, it } from "vitest";
import { getTenantSlug } from "./tenant";

describe("getTenantSlug", () => {
  it("returns the development tenant slug for localhost hosts", () => {
    expect(getTenantSlug("localhost:5173")).toBe("demo");
    expect(getTenantSlug("127.0.0.1:4173")).toBe("demo");
  });

  it("returns null for a configured root domain", () => {
    expect(getTenantSlug("infopers.web.id")).toBeNull();
    expect(getTenantSlug("infopers.biz.id")).toBeNull();
  });

  it("returns the subdomain as tenant slug for known root domains", () => {
    expect(getTenantSlug("clienta.infopers.web.id")).toBe("clienta");
    expect(getTenantSlug("press.infopers.biz.id")).toBe("press");
  });
});
