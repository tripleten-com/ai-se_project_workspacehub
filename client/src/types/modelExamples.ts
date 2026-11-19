import { buildProjectWithTaskCount } from "../utils/projectMetrics";
import type {
  AuthSession,
  Booking,
  FeatureFlags,
  MePayload,
  Organization,
  Project,
  ProjectCreatePayload,
  ProjectUpdatePayload,
  ProjectWithTaskCount,
  Task,
  TaskCreatePayload,
  TaskUpdatePayload,
  User,
} from "./models";

export const exampleFeatureFlags: FeatureFlags = {
  scheduling: true,
  advancedReports: true,
  customBranding: false,
};

export const exampleOrganization: Organization = {
  _id: "org-1",
  name: "Acme Workspace",
  slug: "acme-workspace",
  featureFlags: exampleFeatureFlags,
  createdAt: "2026-01-10T09:00:00.000Z",
  updatedAt: "2026-01-10T09:00:00.000Z",
};

export const exampleUser: User = {
  _id: "user-1",
  firstName: "Alex",
  lastName: "Morgan",
  email: "alex@example.com",
  organizationId: exampleOrganization._id,
  role: "owner",
  createdAt: "2026-01-10T09:00:00.000Z",
  updatedAt: "2026-01-10T09:00:00.000Z",
};

export const exampleProject: Project = {
  _id: "project-1",
  organizationId: exampleOrganization._id,
  name: "Website Redesign",
  description: "Refresh the public website and improve navigation.",
  createdBy: exampleUser._id,
  createdAt: "2026-01-12T10:30:00.000Z",
  updatedAt: "2026-01-12T10:30:00.000Z",
};

export const exampleProjectCreatePayload: ProjectCreatePayload = {
  name: exampleProject.name,
  description: exampleProject.description,
};

export const exampleProjectUpdatePayload: ProjectUpdatePayload = {
  description: "Refresh the public website and improve accessibility.",
};

export const exampleTask: Task = {
  _id: "task-1",
  organizationId: exampleOrganization._id,
  projectId: exampleProject._id,
  title: "Build the homepage",
  description: "Create the responsive homepage layout.",
  status: "in_progress",
  priority: "high",
  assignedTo: exampleUser._id,
  dueDate: "2026-02-20T17:00:00.000Z",
  createdAt: "2026-01-15T11:00:00.000Z",
  updatedAt: "2026-01-15T11:00:00.000Z",
};

export const exampleProjectWithTaskCount: ProjectWithTaskCount =
  buildProjectWithTaskCount(exampleProject, [exampleTask]);

export const exampleTaskCreatePayload: TaskCreatePayload = {
  projectId: exampleTask.projectId,
  title: exampleTask.title,
  description: exampleTask.description,
  status: exampleTask.status,
  priority: exampleTask.priority,
  assignedTo: exampleTask.assignedTo,
  dueDate: exampleTask.dueDate,
};

export const exampleTaskUpdatePayload: TaskUpdatePayload = {
  status: "done",
};

export const exampleBooking: Booking = {
  _id: "booking-1",
  organizationId: exampleOrganization._id,
  title: "Planning session",
  description: "Review milestones and assignments.",
  startsAt: "2026-02-18T15:00:00.000Z",
  endsAt: "2026-02-18T16:00:00.000Z",
  createdBy: exampleUser._id,
  createdAt: "2026-01-16T12:00:00.000Z",
  updatedAt: "2026-01-16T12:00:00.000Z",
};

export const exampleAuthSession: AuthSession = {
  token: "example-session-token",
  user: exampleUser,
  organization: exampleOrganization,
};

export const exampleMePayload: MePayload = {
  user: exampleUser,
  organization: exampleOrganization,
};
