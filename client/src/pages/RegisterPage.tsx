import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, register } = useAuth();
  const [formState, setFormState] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    organizationName: "",
    organizationSlug: "",
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
      await register(formState);
      navigate("/");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Registration failed",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_right,#fde68a,transparent_35%),linear-gradient(135deg,#f8fafc,#e2e8f0)] px-4 py-10">
      <div className="w-full max-w-2xl rounded-[2rem] bg-white p-8 shadow-xl">
        <p className="text-sm uppercase text-accent">Create Workspace</p>
        <h1 className="mt-3 text-3xl font-semibold text-ink">Register</h1>
        <form
          className="mt-8 grid gap-4 md:grid-cols-2"
          onSubmit={(event) => void handleSubmit(event)}
        >
          <input
            className="rounded-2xl border border-slate-200 transition hover:border-slate-300 px-4 py-3 placeholder:text-[#94A3B880]"
            onChange={(event) =>
              setFormState((current) => ({
                ...current,
                firstName: event.target.value,
              }))
            }
            placeholder="First name"
            value={formState.firstName}
          />
          <input
            className="rounded-2xl border border-slate-200 transition hover:border-slate-300 px-4 py-3 placeholder:text-[#94A3B880]"
            onChange={(event) =>
              setFormState((current) => ({
                ...current,
                lastName: event.target.value,
              }))
            }
            placeholder="Last name"
            value={formState.lastName}
          />
          <input
            className="rounded-2xl border border-slate-200 transition hover:border-slate-300 px-4 py-3 md:col-span-2 placeholder:text-[#94A3B880]"
            onChange={(event) =>
              setFormState((current) => ({
                ...current,
                email: event.target.value,
              }))
            }
            placeholder="Email"
            type="email"
            value={formState.email}
          />
          <input
            className="rounded-2xl border border-slate-200 transition hover:border-slate-300 px-4 py-3 md:col-span-2 placeholder:text-[#94A3B880]"
            onChange={(event) =>
              setFormState((current) => ({
                ...current,
                password: event.target.value,
              }))
            }
            placeholder="Password"
            type="password"
            value={formState.password}
          />
          <input
            className="rounded-2xl border border-slate-200 transition hover:border-slate-300 px-4 py-3 placeholder:text-[#94A3B880]"
            onChange={(event) =>
              setFormState((current) => ({
                ...current,
                organizationName: event.target.value,
              }))
            }
            placeholder="Organization name"
            value={formState.organizationName}
          />
          <div className="space-y-2">
            <input
              className="w-full rounded-2xl border border-slate-200 transition hover:border-slate-300 px-4 py-3 placeholder:text-[#94A3B880]"
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  organizationSlug: event.target.value.toLowerCase(),
                }))
              }
              placeholder="url-org-identifier ex: (tripleten)"
              value={formState.organizationSlug}
            />
            <p className="text-xs text-slate-500">
              url-org-identifier ex: (tripleten)
            </p>
          </div>
          {error ? (
            <p className="text-sm text-danger md:col-span-2">{error}</p>
          ) : null}
          <button
            className="rounded-[12px] bg-ink px-4 py-3 font-medium text-white transition hover:opacity-80 active:opacity-70 disabled:cursor-not-allowed disabled:opacity-50 md:col-span-2"
            disabled={submitting}
            type="submit"
          >
            {submitting ? "Creating workspace..." : "Create workspace"}
          </button>
        </form>
        <p className="mt-6 text-sm text-slate-600">
          Already have an account?{" "}
          <Link
            className="font-medium text-brand transition hover:underline active:opacity-70"
            to="/login"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};
