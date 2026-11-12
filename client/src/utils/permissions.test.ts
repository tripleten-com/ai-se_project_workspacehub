import { describe, expect, it } from "vitest";
import type { User, UserRole } from "../types/models";
import { canCreateProject, isPrivilegedRole } from "./permissions";

const buildUser = (role: UserRole): User => ({
  _id: `user-${role}`,
  firstName: "Test",
  lastName: "User",
  email: `${role}@workspacehub.dev`,
  organizationId: "org-1",
  role,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
});

describe("isPrivilegedRole", () => {
  it("treats owners and admins as privileged", () => {
    expect(isPrivilegedRole("owner")).toBe(true);
    expect(isPrivilegedRole("admin")).toBe(true);
  });

  it("does not treat members as privileged", () => {
    expect(isPrivilegedRole("member")).toBe(false);
  });

  it("does not treat a missing role as privileged", () => {
    expect(isPrivilegedRole(undefined)).toBe(false);
    expect(isPrivilegedRole(null)).toBe(false);
  });
});

describe("canCreateProject", () => {
  it("allows owners and admins to create projects", () => {
    expect(canCreateProject(buildUser("owner"))).toBe(true);
    expect(canCreateProject(buildUser("admin"))).toBe(true);
  });

  it("blocks members from creating projects", () => {
    expect(canCreateProject(buildUser("member"))).toBe(false);
  });

  it("blocks signed-out users from creating projects", () => {
    expect(canCreateProject(null)).toBe(false);
  });
});
