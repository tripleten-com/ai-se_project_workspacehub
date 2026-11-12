import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "../components/PageHeader";
import { StatusPanel } from "../components/StatusPanel";
import { projectService } from "../services/projectService";
import { taskService } from "../services/taskService";
import type { Project, ProjectCreatePayload, Task } from "../types/models";
import type { ProjectWithTaskCount } from "../types/views";
import { buildProjectWithTaskCount } from "../utils/projectMetrics";
import { useAuth } from "../hooks/useAuth";
import { canCreateProject, canDeleteResources } from "../utils/permissions";

export const ProjectsPage = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [formState, setFormState] = useState<ProjectCreatePayload>({
    name: "",
    description: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const projectsWithTaskCounts: ProjectWithTaskCount[] = useMemo(
    () => projects.map((project) => buildProjectWithTaskCount(project, tasks)),
    [projects, tasks],
  );

  const loadProjects = async () => {
    setLoading(true);
    setLoadError(null);

    try {
      const [nextProjects, nextTasks] = await Promise.all([
        projectService.list(),
        taskService.list(),
      ]);
      setProjects(nextProjects);
      setTasks(nextTasks);
    } catch (loadError) {
      setLoadError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load projects",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadProjects();
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setActionError(null);

    try {
      const project = await projectService.create(formState);
      setProjects((current) => [project, ...current]);
      setFormState({ name: "", description: "" });
    } catch (submitError) {
      setActionError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to create project",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (projectId: string) => {
    try {
      await projectService.delete(projectId);
      setProjects((current) =>
        current.filter((project) => project._id !== projectId),
      );
    } catch (deleteError) {
      setActionError(
        deleteError instanceof Error
          ? deleteError.message
          : "Unable to delete project",
      );
    }
  };

  if (loading) {
    return (
      <StatusPanel title="Loading projects" message="Fetching project list." />
    );
  }

  if (loadError) {
    return <StatusPanel title="Projects unavailable" message={loadError} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        description="Create internal projects and keep org-scoped delivery work organized."
        title="Projects"
      />
      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        {canCreateProject(user) ? (
          <form
            className="rounded-3xl bg-white p-6 shadow-sm"
            onSubmit={(event) => void handleSubmit(event)}
          >
            <h2 className="text-xl font-semibold text-ink">Create project</h2>
            <div className="mt-4 space-y-4">
              <input
                className="w-full rounded-2xl border border-slate-200 transition hover:border-slate-300 px-4 py-3 placeholder:text-[#94A3B880]"
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                placeholder="Project name"
                value={formState.name}
              />
              <textarea
                className="min-h-32 w-full rounded-2xl border border-slate-200 transition hover:border-slate-300 px-4 py-3 placeholder:text-[#94A3B880]"
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                placeholder="Description"
                value={formState.description}
              />
              {actionError ? (
                <p className="text-sm text-danger">{actionError}</p>
              ) : null}
              <button
                className="rounded-[12px] bg-ink px-4 py-3 font-medium text-white transition hover:opacity-80 active:opacity-70 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={saving}
                type="submit"
              >
                {saving ? "Creating..." : "Create project"}
              </button>
            </div>
          </form>
        ) : (
          <StatusPanel
            title="Project creation restricted"
            message="Only owners and admins can create new projects from this page."
          />
        )}
        {projectsWithTaskCounts.length ? (
          <ul className="space-y-4">
            {projectsWithTaskCounts.map((project) => (
              <li key={project._id}>
                <article className="rounded-3xl bg-white p-6 shadow-sm">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-ink">
                        {project.name}
                      </h2>
                      <p className="mt-2 text-sm text-slate-600">
                        {project.description}
                      </p>
                      <p className="mt-2 text-sm text-slate-500">
                        {project.taskCount}{" "}
                        {project.taskCount === 1 ? "task" : "tasks"}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        className="rounded-[10px] bg-panel px-4 py-2 text-sm font-medium text-ink transition hover:bg-slate-200 active:bg-slate-300"
                        to={`/projects/${project._id}`}
                      >
                        View details
                      </Link>
                      {canDeleteResources(user) ? (
                        <button
                          className="rounded-[10px] px-4 py-2 text-sm font-normal text-danger transition hover:bg-rose-50 active:opacity-70"
                          onClick={() => void handleDelete(project._id)}
                          type="button"
                        >
                          Delete
                        </button>
                      ) : null}
                    </div>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        ) : (
          <StatusPanel
            title="No projects yet"
            message="Create the first project to start organizing work."
          />
        )}
      </section>
    </div>
  );
};
