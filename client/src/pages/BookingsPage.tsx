import { useEffect, useState, type FormEvent } from "react";
import { PageHeader } from "../components/PageHeader";
import { StatusPanel } from "../components/StatusPanel";
import { useAuth } from "../hooks/useAuth";
import { bookingService } from "../services/bookingService";
import type { Booking } from "../types/models";
import { formatDateTimeInput } from "../utils/date";
import { canDeleteResources, canEditBooking } from "../utils/permissions";

interface BookingFormState {
  title: string;
  description: string;
  startsAt: string;
  endsAt: string;
}

const buildBookingFormState = (booking: Booking): BookingFormState => ({
  title: booking.title,
  description: booking.description,
  startsAt: formatDateTimeInput(booking.startsAt),
  endsAt: formatDateTimeInput(booking.endsAt),
});

export const BookingsPage = () => {
  const { isFeatureEnabled, user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingEdits, setBookingEdits] = useState<
    Record<string, BookingFormState>
  >({});
  const [createState, setCreateState] = useState<BookingFormState>({
    title: "",
    description: "",
    startsAt: "",
    endsAt: "",
  });
  const [loading, setLoading] = useState(true);
  const [createError, setCreateError] = useState<string | null>(null);
  const [bookingErrors, setBookingErrors] = useState<Record<string, string>>(
    {},
  );
  const [createTouched, setCreateTouched] = useState<
    Partial<Record<keyof BookingFormState, boolean>>
  >({});
  const [bookingTouched, setBookingTouched] = useState<
    Record<string, Partial<Record<keyof BookingFormState, boolean>>>
  >({});

  useEffect(() => {
    const loadBookings = async () => {
      if (!isFeatureEnabled("scheduling")) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setCreateError(null);

      try {
        const nextBookings = await bookingService.list();
        setBookings(nextBookings);
        setBookingEdits(
          Object.fromEntries(
            nextBookings.map((booking) => [
              booking._id,
              buildBookingFormState(booking),
            ]),
          ),
        );
      } catch (loadError) {
        setCreateError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load bookings",
        );
      } finally {
        setLoading(false);
      }
    };

    void loadBookings();
  }, [isFeatureEnabled]);

  const getBookingErrors = (
    formState: BookingFormState,
  ): Partial<Record<keyof BookingFormState, string>> => {
    const errors: Partial<Record<keyof BookingFormState, string>> = {};

    if (formState.title.trim().length < 2) {
      errors.title = "Title must be at least 2 characters";
    }

    if (!formState.startsAt) {
      errors.startsAt = "Start time is required";
    } else if (Number.isNaN(new Date(formState.startsAt).getTime())) {
      errors.startsAt = "Start time must be a valid date";
    }

    if (!formState.endsAt) {
      errors.endsAt = "End time is required";
    } else if (Number.isNaN(new Date(formState.endsAt).getTime())) {
      errors.endsAt = "End time must be a valid date";
    } else {
      const startsAt = new Date(formState.startsAt);
      const endsAt = new Date(formState.endsAt);

      if (
        !Number.isNaN(startsAt.getTime()) &&
        endsAt.getTime() <= startsAt.getTime()
      ) {
        errors.endsAt = "End time must be after start time";
      }
    }

    return errors;
  };

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCreateError(null);

    const validationError = getBookingErrors(createState);

    if (Object.keys(validationError).length) {
      setCreateTouched({
        title: true,
        startsAt: true,
        endsAt: true,
      });
      return;
    }

    try {
      const booking = await bookingService.create(createState);
      setBookings((current) =>
        [...current, booking].sort((left, right) =>
          left.startsAt.localeCompare(right.startsAt),
        ),
      );
      setBookingEdits((current) => ({
        ...current,
        [booking._id]: buildBookingFormState(booking),
      }));
      setCreateState({
        title: "",
        description: "",
        startsAt: "",
        endsAt: "",
      });
      setCreateTouched({});
      setCreateError(null);
    } catch (createError) {
      setCreateError(
        createError instanceof Error
          ? createError.message
          : "Unable to create booking",
      );
    }
  };

  const handleEdit = (
    bookingId: string,
    field: keyof BookingFormState,
    value: string,
  ) => {
    setBookingErrors((current) => ({
      ...current,
      [bookingId]: "",
    }));
    setBookingEdits((current) => ({
      ...current,
      [bookingId]: {
        ...current[bookingId],
        [field]: value,
      },
    }));
  };

  const handleSave = async (bookingId: string) => {
    setBookingErrors((current) => ({ ...current, [bookingId]: "" }));
    const formState = bookingEdits[bookingId];

    if (!formState) {
      setBookingErrors((current) => ({
        ...current,
        [bookingId]: "Unable to load this booking form",
      }));
      return;
    }

    const validationError = getBookingErrors(formState);

    if (Object.keys(validationError).length) {
      setBookingTouched((current) => ({
        ...current,
        [bookingId]: {
          title: true,
          startsAt: true,
          endsAt: true,
        },
      }));
      return;
    }

    try {
      const updatedBooking = await bookingService.update(bookingId, formState);
      setBookings((current) =>
        current.map((booking) =>
          booking._id === bookingId ? updatedBooking : booking,
        ),
      );
      setBookingEdits((current) => ({
        ...current,
        [bookingId]: buildBookingFormState(updatedBooking),
      }));
      setBookingTouched((current) => ({
        ...current,
        [bookingId]: {},
      }));
      setBookingErrors((current) => ({ ...current, [bookingId]: "" }));
    } catch (saveError) {
      setBookingErrors((current) => ({
        ...current,
        [bookingId]:
          saveError instanceof Error
            ? saveError.message
            : "Unable to update booking",
      }));
    }
  };

  const handleDelete = async (bookingId: string) => {
    setBookingErrors((current) => ({ ...current, [bookingId]: "" }));

    try {
      await bookingService.delete(bookingId);
      setBookings((current) =>
        current.filter((booking) => booking._id !== bookingId),
      );
      setBookingErrors((current) => {
        const next = { ...current };
        delete next[bookingId];
        return next;
      });
    } catch (deleteError) {
      setBookingErrors((current) => ({
        ...current,
        [bookingId]:
          deleteError instanceof Error
            ? deleteError.message
            : "Unable to delete booking",
      }));
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

  const createErrors = getBookingErrors(createState);

  return (
    <div className="space-y-6">
      <PageHeader
        description="Manage simple shared bookings with conflict prevention on the API."
        title="Bookings"
      />
      <section className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <form
          className="rounded-3xl bg-white p-6 shadow-sm"
          onSubmit={handleCreate}
        >
          <h2 className="text-xl font-semibold text-ink">Create booking</h2>
          <div className="mt-4 space-y-4">
            <input
              className="w-full rounded-2xl border border-slate-200 transition hover:border-slate-300 px-4 py-3 placeholder:text-[#94A3B880]"
              onChange={(event) =>
                setCreateState((current) => ({
                  ...current,
                  title: event.target.value,
                }))
              }
              onBlur={() =>
                setCreateTouched((current) => ({
                  ...current,
                  title: true,
                }))
              }
              placeholder="Booking title"
              value={createState.title}
            />
            {createTouched.title && createErrors.title ? (
              <p className="text-sm text-danger">{createErrors.title}</p>
            ) : null}
            <textarea
              className="min-h-28 w-full rounded-2xl border border-slate-200 transition hover:border-slate-300 px-4 py-3 placeholder:text-[#94A3B880]"
              onChange={(event) =>
                setCreateState((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
              placeholder="Booking description"
              value={createState.description}
            />
            <input
              className="w-full rounded-2xl border border-slate-200 transition hover:border-slate-300 px-4 py-3"
              onChange={(event) =>
                setCreateState((current) => ({
                  ...current,
                  startsAt: event.target.value,
                }))
              }
              onBlur={() =>
                setCreateTouched((current) => ({
                  ...current,
                  startsAt: true,
                }))
              }
              type="datetime-local"
              value={createState.startsAt}
            />
            {createTouched.startsAt && createErrors.startsAt ? (
              <p className="text-sm text-danger">
                {createErrors.startsAt}
              </p>
            ) : null}
            <input
              className="w-full rounded-2xl border border-slate-200 transition hover:border-slate-300 px-4 py-3"
              onChange={(event) =>
                setCreateState((current) => ({
                  ...current,
                  endsAt: event.target.value,
                }))
              }
              onBlur={() =>
                setCreateTouched((current) => ({
                  ...current,
                  endsAt: true,
                }))
              }
              type="datetime-local"
              value={createState.endsAt}
            />
            {createTouched.endsAt && createErrors.endsAt ? (
              <p className="text-sm text-danger">{createErrors.endsAt}</p>
            ) : null}
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
        {bookings.length ? (
          <ul className="space-y-4">
            {bookings.map((booking) => {
              const canEdit = canEditBooking(user, booking);
              const formState = bookingEdits[booking._id];
              const editErrors = formState
                ? getBookingErrors(formState)
                : {};

              return (
                <li key={booking._id}>
                  <article className="rounded-3xl bg-white p-6 shadow-sm">
                    <div className="grid gap-4 md:grid-cols-2">
                      <input
                        className="rounded-2xl border border-slate-200 transition hover:border-slate-300 px-4 py-3 disabled:bg-slate-100 md:col-span-2"
                        disabled={!canEdit}
                        onChange={(event) =>
                          handleEdit(booking._id, "title", event.target.value)
                        }
                        onBlur={() =>
                          setBookingTouched((current) => ({
                            ...current,
                            [booking._id]: {
                              ...current[booking._id],
                              title: true,
                            },
                          }))
                        }
                        value={formState?.title ?? booking.title}
                      />
                      {bookingTouched[booking._id]?.title && editErrors.title ? (
                        <p className="text-sm text-danger md:col-span-2">
                          {editErrors.title}
                        </p>
                      ) : null}
                      <textarea
                        className="min-h-24 rounded-2xl border border-slate-200 transition hover:border-slate-300 px-4 py-3 disabled:bg-slate-100 md:col-span-2"
                        disabled={!canEdit}
                        onChange={(event) =>
                          handleEdit(
                            booking._id,
                            "description",
                            event.target.value,
                          )
                        }
                        value={formState?.description ?? booking.description}
                      />
                      <input
                        className="rounded-2xl border border-slate-200 transition hover:border-slate-300 px-4 py-3 disabled:bg-slate-100"
                        disabled={!canEdit}
                        onChange={(event) =>
                          handleEdit(
                            booking._id,
                            "startsAt",
                            event.target.value,
                          )
                        }
                        onBlur={() =>
                          setBookingTouched((current) => ({
                            ...current,
                            [booking._id]: {
                              ...current[booking._id],
                              startsAt: true,
                            },
                          }))
                        }
                        type="datetime-local"
                        value={
                          formState?.startsAt ??
                          formatDateTimeInput(booking.startsAt)
                        }
                      />
                      {bookingTouched[booking._id]?.startsAt &&
                      editErrors.startsAt ? (
                        <p className="text-sm text-danger">
                          {editErrors.startsAt}
                        </p>
                      ) : null}
                      <input
                        className="rounded-2xl border border-slate-200 transition hover:border-slate-300 px-4 py-3 disabled:bg-slate-100"
                        disabled={!canEdit}
                        onChange={(event) =>
                          handleEdit(booking._id, "endsAt", event.target.value)
                        }
                        onBlur={() =>
                          setBookingTouched((current) => ({
                            ...current,
                            [booking._id]: {
                              ...current[booking._id],
                              endsAt: true,
                            },
                          }))
                        }
                        type="datetime-local"
                        value={
                          formState?.endsAt ??
                          formatDateTimeInput(booking.endsAt)
                        }
                      />
                    </div>
                    {bookingErrors[booking._id] ? (
                      <p className="mt-4 text-sm text-danger">
                        {bookingErrors[booking._id]}
                      </p>
                    ) : null}
                    <div className="mt-4 flex flex-wrap gap-3">
                      <button
                        className="rounded-[10px] bg-ink px-4 py-2 text-sm font-medium text-white transition hover:opacity-80 active:opacity-70 disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={!canEdit}
                        onClick={() => void handleSave(booking._id)}
                        type="button"
                      >
                        Save
                      </button>
                      {canDeleteResources(user) ? (
                        <button
                          className="rounded-[10px] px-5 py-2.5 text-sm font-normal text-danger transition hover:bg-rose-50 active:opacity-70"
                          onClick={() => void handleDelete(booking._id)}
                          type="button"
                        >
                          Delete
                        </button>
                      ) : null}
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>
        ) : (
          <StatusPanel
            title="No bookings"
            message="Add the first scheduling entry for this organization."
          />
        )}
      </section>
    </div>
  );
};
