import { describe, expect, it } from "vitest";
import {
  validateBookingFormState,
  type BookingFormState,
} from "./bookingValidation";

const validForm = (): BookingFormState => ({
  title: "Team meeting",
  description: "Weekly planning",
  startsAt: "2026-09-20T10:00",
  endsAt: "2026-09-20T11:00",
});

describe("validateBookingFormState", () => {
  it("returns an empty object for a valid booking", () => {
    expect(validateBookingFormState(validForm())).toEqual({});
  });

  it("requires a title", () => {
    const form = validForm();
    form.title = "";

    expect(validateBookingFormState(form).title).toBe(
      "Booking title is required.",
    );
  });

  it("requires the title to contain at least 2 characters", () => {
    const form = validForm();
    form.title = "A";

    expect(validateBookingFormState(form).title).toBe(
      "Booking title must be at least 2 characters.",
    );
  });

  it("requires a start time", () => {
    const form = validForm();
    form.startsAt = "";

    expect(validateBookingFormState(form).startsAt).toBe(
      "Start time is required.",
    );
  });

  it("requires an end time", () => {
    const form = validForm();
    form.endsAt = "";

    expect(validateBookingFormState(form).endsAt).toBe("End time is required.");
  });

  it("rejects an invalid start date string", () => {
    const form = validForm();
    form.startsAt = "not-a-date";

    expect(validateBookingFormState(form).startsAt).toBe(
      "Start time must be a valid date.",
    );
  });

  it("rejects an invalid end date string", () => {
    const form = validForm();
    form.endsAt = "not-a-date";

    expect(validateBookingFormState(form).endsAt).toBe(
      "End time must be a valid date.",
    );
  });

  it("requires the end time to be after the start time", () => {
    const form = validForm();
    form.startsAt = "2026-09-20T12:00";
    form.endsAt = "2026-09-20T11:00";

    expect(validateBookingFormState(form).endsAt).toBe(
      "End time must be after start time.",
    );
  });

  it("rejects equal start and end times", () => {
    const form = validForm();
    form.startsAt = "2026-09-20T10:00";
    form.endsAt = "2026-09-20T10:00";

    expect(validateBookingFormState(form).endsAt).toBe(
      "End time must be after start time.",
    );
  });
});
