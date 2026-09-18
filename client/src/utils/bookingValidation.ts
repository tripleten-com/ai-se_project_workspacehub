export interface BookingFormState {
  title: string;
  description: string;
  startsAt: string;
  endsAt: string;
}

export type BookingFormErrors = Partial<Record<keyof BookingFormState, string>>;

export const validateBookingFormState = (
  formState: BookingFormState,
): BookingFormErrors => {
  const errors: BookingFormErrors = {};
  const title = formState.title.trim();

  if (!title) {
    errors.title = "Booking title is required.";
  } else if (title.length < 2) {
    errors.title = "Booking title must be at least 2 characters.";
  }

  if (!formState.startsAt) {
    errors.startsAt = "Start time is required.";
  }

  if (!formState.endsAt) {
    errors.endsAt = "End time is required.";
  }

  if (formState.startsAt) {
    const startTime = new Date(formState.startsAt).getTime();

    if (Number.isNaN(startTime)) {
      errors.startsAt = "Start time must be a valid date.";
    }
  }

  if (formState.endsAt) {
    const endTime = new Date(formState.endsAt).getTime();

    if (Number.isNaN(endTime)) {
      errors.endsAt = "End time must be a valid date.";
    }
  }

  if (
    formState.startsAt &&
    formState.endsAt &&
    !errors.startsAt &&
    !errors.endsAt
  ) {
    const startTime = new Date(formState.startsAt).getTime();
    const endTime = new Date(formState.endsAt).getTime();

    if (endTime <= startTime) {
      errors.endsAt = "End time must be after start time.";
    }
  }

  return errors;
};
