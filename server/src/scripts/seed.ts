import bcrypt from "bcryptjs";
import { connectToDatabase } from "../config/database";
import { Booking } from "../models/Booking";
import { Comment } from "../models/Comment";
import { Organization } from "../models/Organization";
import { Project } from "../models/Project";
import { Task } from "../models/Task";
import { User } from "../models/User";
import { deleteTask } from "../services/taskService";

const seed = async () => {
  await connectToDatabase();

  await Promise.all([
    Booking.deleteMany({}),
    Comment.deleteMany({}),
    Task.deleteMany({}),
    Project.deleteMany({}),
    User.deleteMany({}),
    Organization.deleteMany({}),
  ]);

  const organization = await Organization.create({
    name: "Acme Studio",
    slug: "acme-studio",
    featureFlags: {
      scheduling: true,
      advancedReports: true,
      customBranding: true,
    },
  });

  const passwordHash = await bcrypt.hash("Password123!", 10);

  const [owner, admin, member] = await User.create([
    {
      firstName: "Olivia",
      lastName: "Owner",
      email: "owner@workspacehub.dev",
      passwordHash,
      organizationId: organization._id,
      role: "owner",
    },
    {
      firstName: "Aiden",
      lastName: "Admin",
      email: "admin@workspacehub.dev",
      passwordHash,
      organizationId: organization._id,
      role: "admin",
    },
    {
      firstName: "Maya",
      lastName: "Member",
      email: "member@workspacehub.dev",
      passwordHash,
      organizationId: organization._id,
      role: "member",
    },
  ]);

  const [projectOne, projectTwo] = await Project.create([
    {
      organizationId: organization._id,
      name: "Platform Refresh",
      description: "Revamp the internal platform dashboard and delivery flow.",
      createdBy: owner._id,
    },
    {
      organizationId: organization._id,
      name: "Customer Portal",
      description:
        "Deliver a lightweight self-service portal for client requests.",
      createdBy: admin._id,
    },
  ]);

  const tasks = await Task.create([
    {
      organizationId: organization._id,
      projectId: projectOne._id,
      title: "Audit current navigation",
      description: "Document current IA issues and stale routes.",
      status: "todo",
      priority: "medium",
      assignedTo: member._id,
      dueDate: new Date("2026-04-08T17:00:00.000Z"),
      createdAt: new Date("2026-04-24T12:00:00.000Z"),
    },
    {
      organizationId: organization._id,
      projectId: projectOne._id,
      title: "Plan migration milestones",
      description: "Define release slices for the dashboard refresh.",
      status: "in_progress",
      priority: "high",
      assignedTo: admin._id,
      dueDate: new Date("2026-04-10T16:00:00.000Z"),
      createdAt: new Date("2026-04-23T12:00:00.000Z"),
    },
    {
      organizationId: organization._id,
      projectId: projectTwo._id,
      title: "Draft portal access rules",
      description: "Capture basic access rules and team approvals.",
      status: "todo",
      priority: "high",
      assignedTo: owner._id,
      dueDate: new Date("2026-04-12T18:00:00.000Z"),
      createdAt: new Date("2026-04-22T12:00:00.000Z"),
    },
    {
      organizationId: organization._id,
      projectId: projectTwo._id,
      title: "Prepare customer FAQ",
      description: "List the first ten questions clients ask most often.",
      status: "done",
      priority: "low",
      assignedTo: member._id,
      dueDate: new Date("2026-04-04T15:00:00.000Z"),
      createdAt: new Date("2026-04-21T12:00:00.000Z"),
    },
    {
      organizationId: organization._id,
      projectId: projectOne._id,
      title: "Review analytics gaps",
      description: "Identify missing data points before report expansion.",
      status: "in_progress",
      priority: "medium",
      assignedTo: owner._id,
      dueDate: new Date("2026-04-15T19:00:00.000Z"),
      createdAt: new Date("2026-04-20T12:00:00.000Z"),
    },
  ]);

  await Comment.create([
    {
      organizationId: organization._id,
      taskId: tasks[0]._id,
      authorId: owner._id,
      content: "I will review the current navigation patterns.",
    },
    {
      organizationId: organization._id,
      taskId: tasks[0]._id,
      authorId: admin._id,
      content: "Please include the mobile navigation in the audit.",
    },
    {
      organizationId: organization._id,
      taskId: tasks[0]._id,
      authorId: member._id,
      content: "I found two outdated links to document.",
    },
  ]);

  const [temporaryAuthor] = await User.create([
    {
      firstName: "Temporary",
      lastName: "Contributor",
      email: "temporary-contributor@workspacehub.dev",
      passwordHash,
      organizationId: organization._id,
      role: "member",
    },
  ]);

  await Comment.create({
    organizationId: organization._id,
    taskId: tasks[0]._id,
    authorId: temporaryAuthor._id,
    content: "This comment remains after the contributor is removed.",
  });
  await User.deleteOne({ _id: temporaryAuthor._id });

  const [ghostTask] = await Task.create([
    {
      organizationId: organization._id,
      projectId: projectOne._id,
      title: "Temporary task for orphan comment test",
      description: "This task is removed after its comment is created.",
      status: "todo",
      priority: "low",
      assignedTo: owner._id,
      dueDate: null,
    },
  ]);

  await Comment.create({
    organizationId: organization._id,
    taskId: ghostTask._id,
    authorId: owner._id,
    content: "This comment will temporarily reference a deleted task.",
  });
  await deleteTask(
    {
      userId: String(owner._id),
      organizationId: String(organization._id),
      role: "owner",
    },
    String(ghostTask._id),
  );

  await Booking.create([
    {
      organizationId: organization._id,
      title: "Sprint planning",
      description: "Weekly team planning block.",
      startsAt: new Date("2026-04-06T14:00:00.000Z"),
      endsAt: new Date("2026-04-06T15:00:00.000Z"),
      createdBy: owner._id,
    },
    {
      organizationId: organization._id,
      title: "Portal review",
      description: "Feature walkthrough with the delivery team.",
      startsAt: new Date("2026-04-06T16:00:00.000Z"),
      endsAt: new Date("2026-04-06T17:00:00.000Z"),
      createdBy: admin._id,
    },
  ]);

  console.log("Seed complete");
  process.exit(0);
};

void seed().catch((error) => {
  console.error("Seed failed", error);
  process.exit(1);
});
