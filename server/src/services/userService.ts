import { User } from "../models/User";
import type { AuthPayload } from "../types/domain";
import { AppError } from "../utils/appError";
import { assertFound } from "../utils/scopedQuery";
import { parseRole, requireString } from "../utils/validators";
import { canChangeUserRole, canManageUsers } from "./permissionService";

export const listUsers = async (organizationId: string) => {
  return User.find({ organizationId })
    .select("-passwordHash")
    .sort({ createdAt: 1 });
};

export const getUserById = async (organizationId: string, id: string) => {
  const found = await User.findOne({ _id: id, organizationId });
  const user = assertFound(found, "User");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash: _passwordHash, ...userObject } = user.toObject();
  return userObject;
};

export const updateUser = async (
  actor: AuthPayload,
  userId: string,
  payload: Record<string, unknown>,
) => {
  const found = await User.findOne({
    _id: userId,
    organizationId: actor.organizationId,
  });
  const user = assertFound(found, "User");

  if (!canManageUsers(actor, String(user._id))) {
    throw new AppError("You do not have permission to update this user", 403);
  }

  if (payload.firstName !== undefined) {
    user.firstName = requireString(payload.firstName, "First name");
  }

  if (payload.lastName !== undefined) {
    user.lastName = requireString(payload.lastName, "Last name");
  }

  if (payload.role !== undefined) {
    const nextRole = parseRole(payload.role);

    if (!canChangeUserRole(actor, nextRole, user.role)) {
      throw new AppError("You do not have permission to change this role", 403);
    }

    user.role = nextRole;
  }

  await user.save();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash: _passwordHash, ...userObject } = user.toObject();
  return userObject;
};
