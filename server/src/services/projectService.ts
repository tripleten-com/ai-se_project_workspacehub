import { Project } from "../models/Project";
import type { AuthPayload } from "../types/domain";
import { AppError } from "../utils/appError";
import { assertFound } from "../utils/scopedQuery";
import { optionalString, requireStringLength } from "../utils/validators";
import {
  canDeleteResource,
  canManageProject,
  isPrivilegedRole,
} from "./permissionService";

export const listProjects = async (organizationId: string) => {
  return Project.find({ organizationId }).sort({ createdAt: -1 });
};

export const createProject = async (
  actor: AuthPayload,
  payload: Record<string, unknown>,
) => {
  if (!isPrivilegedRole(actor.role)) {
    throw new AppError("Only owners and admins can create projects", 403);
  }

  const name = requireStringLength(payload.name, "Name", 2);
  const description = optionalString(payload.description) ?? "";

  return Project.create({
    organizationId: actor.organizationId,
    name,
    description,
    createdBy: actor.userId,
  });
};

export const getProjectById = async (organizationId: string, id: string) => {
  const project = await Project.findOne({ _id: id, organizationId });
  return assertFound(project, "Project");
};

export const updateProject = async (
  actor: AuthPayload,
  id: string,
  payload: Record<string, unknown>,
) => {
  const project = await getProjectById(actor.organizationId, id);

  if (!canManageProject(actor, String(project.createdBy))) {
    throw new AppError(
      "You do not have permission to update this project",
      403,
    );
  }

  if (payload.name !== undefined) {
    project.name = requireStringLength(payload.name, "Name", 2);
  }

  if (payload.description !== undefined) {
    project.description = optionalString(payload.description) ?? "";
  }

  await project.save();
  return project;
};

export const deleteProject = async (actor: AuthPayload, id: string) => {
  const project = await getProjectById(actor.organizationId, id);

  if (!canDeleteResource(actor)) {
    throw new AppError(
      "You do not have permission to delete this project",
      403,
    );
  }

  await project.deleteOne();
  return { deleted: true };
};
