export interface BookingFormState {
  title: string;
  description: string;
  startsAt: string;
  endsAt: string;
}

export const getBookingFormErrors = (
  formState: BookingFormState,
): Partial<Record<keyof BookingFormState, string>> => {
  const errors: Partial<Record<keyof BookingFormState, string>> = {};

  if (!formState.title.trim()) {
    errors.title = "Booking title is required.";
  } else if (formState.title.trim().length < 3) {
    errors.title = "Booking title must be at least 3 characters.";
  }

  if (!formState.description.trim()) {
    errors.description = "Booking description is required.";
  }

  if (!formState.startsAt) {
    errors.startsAt = "Start time is required.";
  }

  if (!formState.endsAt) {
    errors.endsAt = "End time is required.";
  }

  const start = formState.startsAt ? new Date(formState.startsAt) : null;
  const end = formState.endsAt ? new Date(formState.endsAt) : null;

  const hasInvalidDate =
    (formState.startsAt && Number.isNaN(start?.getTime() ?? NaN)) ||
    (formState.endsAt && Number.isNaN(end?.getTime() ?? NaN));

  if (hasInvalidDate) {
    errors.startsAt = "Please enter valid start and end times.";
    errors.endsAt = "Please enter valid start and end times.";
  }

  if (
    start &&
    end &&
    !Number.isNaN(start.getTime()) &&
    !Number.isNaN(end.getTime()) &&
    end.getTime() <= start.getTime()
  ) {
    errors.endsAt = "End time must be after start time.";
  }

  return errors;
};
