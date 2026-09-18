import { describe, expect, it } from "vitest";
import type { User } from "../types/models";
import { canCreateProject, isPrivilegedRole } from "./permissions";

const userWithRole = (role: User["role"]): User =>
  ({
    role,
  }) as User;

describe("isPrivilegedRole", () => {
  it("returns true for owner", () => {
    expect(isPrivilegedRole("owner")).toBe(true);
  });

  it("returns true for admin", () => {
    expect(isPrivilegedRole("admin")).toBe(true);
  });

  it("returns false for member", () => {
    expect(isPrivilegedRole("member")).toBe(false);
  });

  it("returns false when the role is missing", () => {
    expect(isPrivilegedRole(null)).toBe(false);
  });
});

describe("canCreateProject", () => {
  it("allows an owner to create projects", () => {
    expect(canCreateProject(userWithRole("owner"))).toBe(true);
  });

  it("allows an admin to create projects", () => {
    expect(canCreateProject(userWithRole("admin"))).toBe(true);
  });

  it("does not allow a member to create projects", () => {
    expect(canCreateProject(userWithRole("member"))).toBe(false);
  });

  it("does not allow project creation when the user is null", () => {
    expect(canCreateProject(null)).toBe(false);
  });
});
