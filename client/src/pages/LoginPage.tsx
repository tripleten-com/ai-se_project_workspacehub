import { useState, type FormEvent } from "react";
import { Navigate, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export const LoginPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAuth();
  const [formState, setFormState] = useState({
    email: "",
    password: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await login(formState);
      navigate("/");
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "Login failed",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,#d1fae5,transparent_35%),linear-gradient(135deg,#f8fafc,#e2e8f0)] px-4">
      <div className="w-full max-w-md rounded-[2rem] bg-white p-8 shadow-xl">
        <p className="text-sm uppercase text-brand">WorkspaceHub</p>
        <h1 className="mt-3 text-3xl font-semibold text-ink">Sign in</h1>
        <p className="mt-2 text-sm text-slate-600">
          Use the seeded demo accounts or register a new organization.
        </p>
        <form
          className="mt-8 space-y-4"
          onSubmit={(event) => void handleSubmit(event)}
        >
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              className="w-full rounded-2xl border border-slate-200 transition hover:border-slate-300 px-4 py-3"
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  email: event.target.value,
                }))
              }
              type="email"
              value={formState.email}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              className="w-full rounded-2xl border border-slate-200 transition hover:border-slate-300 px-4 py-3"
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  password: event.target.value,
                }))
              }
              type="password"
              value={formState.password}
            />
          </div>
          {error ? <p className="text-sm text-danger">{error}</p> : null}
          <button
            className="w-full rounded-[12px] bg-ink px-4 py-3 font-medium text-white transition hover:opacity-80 active:opacity-70 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={submitting}
            type="submit"
          >
            {submitting ? "Signing in..." : "Sign in"}
          </button>
        </form>
        <p className="mt-6 text-sm text-slate-600">
          Need a workspace?{" "}
          <Link
            className="font-medium text-brand transition hover:underline active:opacity-70"
            to="/register"
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};
