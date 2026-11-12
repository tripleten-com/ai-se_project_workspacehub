export interface BookingFormState {
  title: string;
  description: string;
  startsAt: string;
  endsAt: string;
}

export type BookingFormErrors = Partial<Record<keyof BookingFormState, string>>;

const isValidDateTime = (value: string) => {
  const match = value.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?$/,
  );

  if (!match) {
    return false;
  }

  const [, year, month, day, hour, minute, second = "0"] = match;
  // Check the calendar date and clock fields separately so wall-clock times
  // skipped by a DST transition are not rejected as invalid.
  const date = new Date(Number(year), Number(month) - 1, Number(day));

  return (
    date.getFullYear() === Number(year) &&
    date.getMonth() + 1 === Number(month) &&
    date.getDate() === Number(day) &&
    Number(hour) <= 23 &&
    Number(minute) <= 59 &&
    Number(second) <= 59
  );
};

export const validateBookingFormState = (
  formState: BookingFormState,
): BookingFormErrors => {
  const errors: BookingFormErrors = {};
  const title = formState.title.trim();

  if (!title) {
    errors.title = "Title is required";
  } else if (title.length < 2) {
    errors.title = "Title must be at least 2 characters";
  }

  if (!formState.startsAt.trim()) {
    errors.startsAt = "Start time is required";
  } else if (!isValidDateTime(formState.startsAt)) {
    errors.startsAt = "Start time must be a valid date and time";
  }

  if (!formState.endsAt.trim()) {
    errors.endsAt = "End time is required";
  } else if (!isValidDateTime(formState.endsAt)) {
    errors.endsAt = "End time must be a valid date and time";
  } else if (
    isValidDateTime(formState.startsAt) &&
    new Date(formState.endsAt) <= new Date(formState.startsAt)
  ) {
    errors.endsAt = "End time must be after start time";
  }

  return errors;
};
