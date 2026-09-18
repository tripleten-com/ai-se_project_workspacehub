import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Checkbox } from "../components/Checkbox";
import { PageHeader } from "../components/PageHeader";
import { StatusPanel } from "../components/StatusPanel";
import { bookingService } from "../services/bookingService";
import { projectService } from "../services/projectService";
import { taskService } from "../services/taskService";
import { userService } from "../services/userService";
import { useAuth } from "../hooks/useAuth";
import type {
  Booking,
  FeatureFlags,
  Project,
  Task,
  User,
} from "../types/models";
import { formatDateTime } from "../utils/date";

interface DashboardData {
  projects: Project[];
  tasks: Task[];
  users: User[];
  bookings: Booking[];
}

const statusBadgeStyles: Record<Task["status"], string> = {
  todo: "bg-[#cfe7ff] text-ink",
  in_progress: "bg-amber-100 text-amber-800",
  done: "bg-[#dcf2ed] text-success",
};

export const DashboardPage = () => {
  const { organization, isFeatureEnabled } = useAuth();
  const [data, setData] = useState<DashboardData>({
    projects: [],
    tasks: [],
    users: [],
    bookings: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      setError(null);

      try {
        const [projects, tasks, users, bookings] = await Promise.all([
          projectService.list(),
          taskService.list(),
          userService.list(),
          isFeatureEnabled("scheduling")
            ? bookingService.list()
            : Promise.resolve([]),
        ]);

        setData({ projects, tasks, users, bookings });
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load dashboard",
        );
      } finally {
        setLoading(false);
      }
    };

    void loadDashboard();
  }, [isFeatureEnabled]);

  const upcomingTasks = [...data.tasks]
    .filter((task) => task.dueDate)
    .sort((left, right) => {
      return (
        new Date(left.dueDate ?? "").getTime() -
        new Date(right.dueDate ?? "").getTime()
      );
    })
    .slice(0, 5);

  if (loading) {
    return (
      <StatusPanel
        title="Loading dashboard"
        message="Fetching workspace data."
      />
    );
  }

  if (error) {
    return <StatusPanel title="Dashboard unavailable" message={error} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        description="Monitor organization activity, project volume, and access-sensitive product areas."
        title={`Welcome to ${organization?.name ?? "WorkspaceHub"}`}
      />
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-[20px] bg-white p-4 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Members</p>
          <p className="mt-1 text-2xl font-extrabold text-ink">
            {data.users.length}
          </p>
        </article>
        <article className="rounded-[20px] bg-white p-4 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Projects</p>
          <p className="mt-1 text-2xl font-extrabold text-ink">
            {data.projects.length}
          </p>
        </article>
        <article className="rounded-[20px] bg-white p-4 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Tasks</p>
          <p className="mt-1 text-2xl font-extrabold text-ink">
            {data.tasks.length}
          </p>
        </article>
        <article className="rounded-[20px] bg-white p-4 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Bookings</p>
          <p className="mt-1 text-2xl font-extrabold text-ink">
            {isFeatureEnabled("scheduling") ? data.bookings.length : "Off"}
          </p>
        </article>
      </section>
      <section className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="rounded-[20px] bg-white p-8 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-ink">
              Upcoming task deadlines
            </h2>
            <Link
              className="text-sm font-semibold text-success transition hover:underline active:opacity-70"
              to="/tasks"
            >
              Manage tasks
            </Link>
          </div>
          <div className="mt-4">
            {upcomingTasks.length ? (
              <ul className="space-y-3">
                {upcomingTasks.map((task) => (
                  <li
                    className="rounded-[12px] border border-slate-200 p-[18px]"
                    key={task._id}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-ink">{task.title}</h3>
                        <p className="text-[13px] text-slate-500">
                          Due {formatDateTime(task.dueDate)}
                        </p>
                      </div>
                      <span
                        className={[
                          "rounded-[6px] px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide",
                          statusBadgeStyles[task.status],
                        ].join(" ")}
                      >
                        {task.status.replace("_", " ")}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <StatusPanel
                title="No upcoming tasks"
                message="Assign due dates to surface urgent work here."
              />
            )}
          </div>
        </div>
        <div className="space-y-6">
          <div className="rounded-[20px] bg-white p-8 shadow-sm">
            <h2 className="text-xl font-bold text-ink">Feature flags</h2>
            <ul className="mt-4 space-y-3">
              {(
                Object.entries(organization?.featureFlags ?? {}) as [
                  keyof FeatureFlags,
                  boolean,
                ][]
              ).map(([key, value]) => (
                <li
                  className="flex items-center justify-between rounded-[12px] border border-slate-200 p-[18px]"
                  key={key}
                >
                  <span className="font-semibold capitalize text-ink">
                    {key.replace(/([A-Z])/g, " $1")}
                  </span>
                  <Checkbox checked={value} disabled />
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-[20px] bg-white p-8 shadow-sm">
            <h2 className="text-xl font-bold text-ink">Members</h2>
            <ul className="mt-4 space-y-3">
              {data.users.slice(0, 4).map((member) => (
                <li
                  className="flex items-center justify-between rounded-[12px] border border-slate-200 p-[18px]"
                  key={member._id}
                >
                  <div>
                    <p className="font-semibold text-ink">
                      {member.firstName} {member.lastName}
                    </p>
                    <p className="text-sm text-slate-500">{member.email}</p>
                  </div>
                  <span className="text-sm capitalize text-slate-500">
                    {member.role}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-[20px] bg-white p-8 shadow-sm">
            <h2 className="text-xl font-bold text-ink">Scheduling</h2>
            {isFeatureEnabled("scheduling") ? (
              <div className="mt-4">
                {data.bookings.length ? (
                  <ul className="space-y-3">
                    {data.bookings.slice(0, 3).map((booking) => (
                      <li
                        className="rounded-2xl border border-slate-200 px-4 py-3"
                        key={booking._id}
                      >
                        <p className="font-medium text-ink">{booking.title}</p>
                        <p className="text-sm text-slate-500">
                          {formatDateTime(booking.startsAt)} to{" "}
                          {formatDateTime(booking.endsAt)}
                        </p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-4 text-sm text-slate-500">
                    No upcoming bookings yet.
                  </p>
                )}
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-500">
                Scheduling is disabled for this organization.
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
