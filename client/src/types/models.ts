export type UserRole = "owner" | "admin" | "member";

export type TaskStatus = "todo" | "in_progress" | "done";

export type TaskPriority = "low" | "medium" | "high";

export interface FeatureFlags {
  scheduling: boolean;
  advancedReports: boolean;
  customBranding: boolean;
}

export interface Organization {
  _id: string;
  name: string;
  slug: string;
  featureFlags: FeatureFlags;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  organizationId: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  _id: string;
  organizationId: string;
  name: string;
  description: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export type ProjectCreatePayload = Pick<Project, "name" | "description">;

export type ProjectUpdatePayload = Partial<ProjectCreatePayload>;

export interface ProjectWithTaskCount extends Project {
  taskCount: number;
}

export interface Task {
  _id: string;
  organizationId: string;
  projectId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo: string | null;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export type TaskCreatePayload = Pick<
  Task,
  | "projectId"
  | "title"
  | "description"
  | "status"
  | "priority"
  | "assignedTo"
  | "dueDate"
>;

export type TaskUpdatePayload = Partial<TaskCreatePayload>;

export interface Booking {
  _id: string;
  organizationId: string;
  title: string;
  description: string;
  startsAt: string;
  endsAt: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthSession {
  token: string;
  user: User;
  organization: Organization;
}

export interface MePayload {
  user: User;
  organization: Organization;
}
