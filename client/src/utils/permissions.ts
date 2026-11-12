import type {
  Booking,
  Comment,
  Project,
  Task,
  User,
  UserRole,
} from "../types/models";

export const isPrivilegedRole = (role?: UserRole | null) => {
  return role === "owner" || role === "admin";
};

export const canEditProject = (user: User | null, project: Project) => {
  if (!user) {
    return false;
  }

  return isPrivilegedRole(user.role) || user._id === project.createdBy;
};

export const canEditTask = (user: User | null, task: Task) => {
  if (!user) {
    return false;
  }

  return isPrivilegedRole(user.role) || user._id === task.assignedTo;
};

export const canEditBooking = (user: User | null, booking: Booking) => {
  if (!user) {
    return false;
  }

  return isPrivilegedRole(user.role) || user._id === booking.createdBy;
};

export const canManageComment = (user: User | null, comment: Comment) => {
  if (!user) {
    return false;
  }

  return isPrivilegedRole(user.role) || user._id === comment.authorId;
};

export const canDeleteResources = (user: User | null) => {
  return isPrivilegedRole(user?.role);
};

export const canCreateProject = (user: User | null) => {
  return isPrivilegedRole(user?.role);
};
