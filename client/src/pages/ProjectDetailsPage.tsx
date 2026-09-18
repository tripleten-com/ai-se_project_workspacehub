import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "../components/PageHeader";
import { StatusPanel } from "../components/StatusPanel";
import { projectService } from "../services/projectService";
import { taskService } from "../services/taskService";
import { useAuth } from "../hooks/useAuth";
import type { Project, Task } from "../types/models";
import { formatDateTime } from "../utils/date";
import { canDeleteResources, canEditProject } from "../utils/permissions";

export const ProjectDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [formState, setFormState] = useState({ name: "", description: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProject = async () => {
      if (!id) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const [nextProject, nextTasks] = await Promise.all([
          projectService.getById(id),
          taskService.list(id),
        ]);

        setProject(nextProject);
        setTasks(nextTasks);
        setFormState({
          name: nextProject.name,
          description: nextProject.description,
        });
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load project",
        );
      } finally {
        setLoading(false);
      }
    };

    void loadProject();
  }, [id]);

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!project) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const updatedProject = await projectService.update(
        project._id,
        formState,
      );
      setProject(updatedProject);
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Unable to update project",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!project) {
      return;
    }

    try {
      await projectService.delete(project._id);
      navigate("/projects");
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Unable to delete project",
      );
    }
  };

  if (loading) {
    return (
      <StatusPanel
        title="Loading project"
        message="Fetching project details."
      />
    );
  }

  if (!project) {
    return (
      <StatusPanel
        title="Project not found"
        message={error ?? "No project matched this route."}
      />
    );
  }

  const canEdit = canEditProject(user, project);

  return (
    <div className="space-y-6">
      <PageHeader
        description="Review project details and the tasks that belong to this workspace initiative."
        title={project.name}
      />
      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <form
          className="rounded-3xl bg-white p-6 shadow-sm"
          onSubmit={(event) => void handleSave(event)}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-ink">Project settings</h2>
            {canDeleteResources(user) ? (
              <button
                className="rounded-[10px] px-4 py-2 text-sm font-normal text-danger transition hover:bg-rose-50 active:opacity-70"
                onClick={() => void handleDelete()}
                type="button"
              >
                Delete project
              </button>
            ) : null}
          </div>
          <div className="mt-4 space-y-4">
            <input
              className="w-full rounded-2xl border border-slate-200 transition hover:border-slate-300 px-4 py-3 disabled:bg-slate-100"
              disabled={!canEdit}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  name: event.target.value,
                }))
              }
              value={formState.name}
            />
            <textarea
              className="min-h-32 w-full rounded-2xl border border-slate-200 transition hover:border-slate-300 px-4 py-3 disabled:bg-slate-100"
              disabled={!canEdit}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
              value={formState.description}
            />
            {error ? <p className="text-sm text-danger">{error}</p> : null}
            <button
              className="rounded-[12px] bg-ink px-4 py-3 font-medium text-white transition hover:opacity-80 active:opacity-70 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!canEdit || saving}
              type="submit"
            >
              {saving ? "Saving..." : canEdit ? "Save changes" : "Read only"}
            </button>
          </div>
        </form>
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-ink">Project tasks</h2>
            <Link
              className="text-sm font-medium text-brand transition hover:underline active:opacity-70"
              to="/tasks"
            >
              Open task board
            </Link>
          </div>
          <div className="mt-4">
            {tasks.length ? (
              <ul className="space-y-3">
                {tasks.map((task) => (
                  <li key={task._id}>
                    <article className="rounded-2xl border border-slate-200 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <h3 className="font-medium text-ink">{task.title}</h3>
                          <p className="mt-1 text-sm text-slate-500">
                            {task.description}
                          </p>
                        </div>
                        <span className="rounded-[10px] bg-slate-100 px-3 py-1 text-xs font-medium uppercase tracking-wide text-slate-600">
                          {task.status.replace("_", " ")}
                        </span>
                      </div>
                      <p className="mt-3 text-sm text-slate-500">
                        Due {formatDateTime(task.dueDate)}
                      </p>
                    </article>
                  </li>
                ))}
              </ul>
            ) : (
              <StatusPanel
                title="No tasks yet"
                message="Add tasks from the task board to populate this project."
              />
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
