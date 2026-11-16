import { useEffect, useState, type FormEvent } from "react";
import { PageHeader } from "../components/PageHeader";
import { StatusPanel } from "../components/StatusPanel";
import { useAuth } from "../hooks/useAuth";
import { bookingService } from "../services/bookingService";
import {
  type BookingFormState,
  validateBookingFormState,
} from "../utils/bookingValidation";

export const BookingsPage = () => {
  const { isFeatureEnabled } = useAuth();

  const [createState, setCreateState] = useState<BookingFormState>({
    title: "",
    description: "",
    startsAt: "",
    endsAt: "",
  });
  const [createTouched, setCreateTouched] = useState<
    Record<keyof BookingFormState, boolean>
  >({
    title: false,
    description: false,
    startsAt: false,
    endsAt: false,
  });
  const [loading, setLoading] = useState(true);
  const [createError, setCreateError] = useState<string | null>(null);

  useEffect(() => {
    const initializePage = () => {
      if (!isFeatureEnabled("scheduling")) {
        setLoading(false);
        return;
      }

      setLoading(false);
    };

    initializePage();
  }, [isFeatureEnabled]);

  const createValidation = validateBookingFormState(createState);

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationErrors = validateBookingFormState(createState);
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setCreateError(null);

    try {
      await bookingService.create(createState);

      setCreateState({
        title: "",
        description: "",
        startsAt: "",
        endsAt: "",
      });
      setCreateTouched({
        title: false,
        description: false,
        startsAt: false,
        endsAt: false,
      });
    } catch (error) {
      setCreateError(
        error instanceof Error ? error.message : "Unable to create booking",
      );
    }
  };

  if (!isFeatureEnabled("scheduling")) {
    return (
      <StatusPanel
        title="Scheduling disabled"
        message="This page is hidden by the organization feature flags."
      />
    );
  }

  if (loading) {
    return (
      <StatusPanel
        title="Loading bookings"
        message="Fetching schedule items."
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        description="Manage simple shared bookings with conflict prevention on the API."
        title="Bookings"
      />

      <section className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <form
          className="rounded-3xl bg-white p-6 shadow-sm"
          onSubmit={(event) => {
            void handleCreate(event);
          }}
        >
          <h2 className="text-xl font-semibold text-ink">Create booking</h2>

          <div className="mt-4 space-y-4">
            <div>
              <input
                className="w-full rounded-2xl border border-slate-200 transition hover:border-slate-300 px-4 py-3 placeholder:text-[#94A3B880]"
                onBlur={() =>
                  setCreateTouched((current) => ({ ...current, title: true }))
                }
                onChange={(event) =>
                  setCreateState((current) => ({
                    ...current,
                    title: event.target.value,
                  }))
                }
                placeholder="Booking title"
                value={createState.title}
              />
              {createTouched.title && createValidation.title ? (
                <p className="mt-1 text-sm text-danger">
                  {createValidation.title}
                </p>
              ) : null}
            </div>

            <div>
              <textarea
                className="min-h-28 w-full rounded-2xl border border-slate-200 transition hover:border-slate-300 px-4 py-3 placeholder:text-[#94A3B880]"
                onBlur={() =>
                  setCreateTouched((current) => ({
                    ...current,
                    description: true,
                  }))
                }
                onChange={(event) =>
                  setCreateState((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                placeholder="Booking description"
                value={createState.description}
              />
              {createTouched.description && createValidation.description ? (
                <p className="mt-1 text-sm text-danger">
                  {createValidation.description}
                </p>
              ) : null}
            </div>

            <div>
              <input
                className="w-full rounded-2xl border border-slate-200 transition hover:border-slate-300 px-4 py-3"
                onBlur={() =>
                  setCreateTouched((current) => ({
                    ...current,
                    startsAt: true,
                  }))
                }
                onChange={(event) =>
                  setCreateState((current) => ({
                    ...current,
                    startsAt: event.target.value,
                  }))
                }
                type="datetime-local"
                value={createState.startsAt}
              />
              {createTouched.startsAt && createValidation.startsAt ? (
                <p className="mt-1 text-sm text-danger">
                  {createValidation.startsAt}
                </p>
              ) : null}
            </div>

            <div>
              <input
                className="w-full rounded-2xl border border-slate-200 transition hover:border-slate-300 px-4 py-3"
                onBlur={() =>
                  setCreateTouched((current) => ({
                    ...current,
                    endsAt: true,
                  }))
                }
                onChange={(event) =>
                  setCreateState((current) => ({
                    ...current,
                    endsAt: event.target.value,
                  }))
                }
                type="datetime-local"
                value={createState.endsAt}
              />
              {createTouched.endsAt && createValidation.endsAt ? (
                <p className="mt-1 text-sm text-danger">
                  {createValidation.endsAt}
                </p>
              ) : null}
            </div>

            {createError ? (
              <p className="text-sm text-danger">{createError}</p>
            ) : null}

            <button
              className="rounded-[12px] bg-ink px-4 py-3 font-medium text-white transition hover:opacity-80 active:opacity-70 disabled:cursor-not-allowed disabled:opacity-50"
              type="submit"
            >
              Create booking
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};
