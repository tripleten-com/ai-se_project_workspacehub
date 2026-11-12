import { describe, expect, it } from "vitest";
import {
  getBookingFormErrors,
  type BookingFormState,
} from "./bookingValidation";

describe("getBookingFormErrors", () => {
  it("returns errors for required fields", () => {
    const formState: BookingFormState = {
      title: "",
      description: "",
      startsAt: "",
      endsAt: "",
    };

    const errors = getBookingFormErrors(formState);

    expect(errors.title).toBe("Booking title is required.");
    expect(errors.description).toBe("Booking description is required.");
    expect(errors.startsAt).toBe("Start time is required.");
    expect(errors.endsAt).toBe("End time is required.");
  });

  it("returns an error when title is too short", () => {
    const formState: BookingFormState = {
      title: "Ab",
      description: "A valid description",
      startsAt: "2026-11-05T10:00",
      endsAt: "2026-11-05T11:00",
    };

    const errors = getBookingFormErrors(formState);

    expect(errors.title).toBe("Booking title must be at least 3 characters.");
  });

  it("returns an error for invalid date strings", () => {
    const formState: BookingFormState = {
      title: "Valid title",
      description: "Valid description",
      startsAt: "not-a-date",
      endsAt: "also-not-a-date",
    };

    const errors = getBookingFormErrors(formState);

    expect(errors.startsAt).toBe("Please enter valid start and end times.");
    expect(errors.endsAt).toBe("Please enter valid start and end times.");
  });

  it("returns an error when end time is before start time", () => {
    const formState: BookingFormState = {
      title: "Valid title",
      description: "Valid description",
      startsAt: "2026-11-05T11:00",
      endsAt: "2026-11-05T10:00",
    };

    const errors = getBookingFormErrors(formState);

    expect(errors.endsAt).toBe("End time must be after start time.");
  });

  it("returns an error when end time is exactly equal to start time", () => {
    const formState: BookingFormState = {
      title: "Valid title",
      description: "Valid description",
      startsAt: "2026-11-05T10:00",
      endsAt: "2026-11-05T10:00",
    };

    const errors = getBookingFormErrors(formState);

    expect(errors.endsAt).toBe("End time must be after start time.");
  });
});
