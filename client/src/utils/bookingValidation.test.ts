import { describe, expect, it } from "vitest";
import {
  validateBookingFormState,
  type BookingFormState,
} from "./bookingValidation";

const validForm: BookingFormState = {
  title: "Sprint planning",
  description: "",
  startsAt: "2026-11-02T09:00",
  endsAt: "2026-11-02T10:00",
};

describe("validateBookingFormState", () => {
  it("returns an empty error map for a valid form", () => {
    expect(validateBookingFormState(validForm)).toEqual({});
  });

  it("requires a title", () => {
    const errors = validateBookingFormState({ ...validForm, title: "   " });

    expect(errors.title).toBeDefined();
  });

  it("rejects titles that are too short", () => {
    const errors = validateBookingFormState({ ...validForm, title: "A" });

    expect(errors.title).toBeDefined();
  });

  it("requires both a start and an end time", () => {
    const errors = validateBookingFormState({
      ...validForm,
      startsAt: "",
      endsAt: "",
    });

    expect(errors.startsAt).toBeDefined();
    expect(errors.endsAt).toBeDefined();
  });

  it("rejects malformed date strings", () => {
    const errors = validateBookingFormState({
      ...validForm,
      startsAt: "not-a-date",
      endsAt: "2026-13-45T09:00",
    });

    expect(errors.startsAt).toBeDefined();
    expect(errors.endsAt).toBeDefined();
  });

  it("rejects an end time before the start time", () => {
    const errors = validateBookingFormState({
      ...validForm,
      startsAt: "2026-11-02T10:00",
      endsAt: "2026-11-02T09:00",
    });

    expect(errors.endsAt).toBeDefined();
  });

  it("requires the end time to be strictly after the start time", () => {
    const errors = validateBookingFormState({
      ...validForm,
      endsAt: validForm.startsAt,
    });

    expect(errors.endsAt).toBeDefined();
  });

  it("only reports errors for the fields that are invalid", () => {
    const errors = validateBookingFormState({ ...validForm, title: "" });

    expect(Object.keys(errors)).toEqual(["title"]);
  });

  it("does not modify the form state it is given", () => {
    const formState = { ...validForm, title: "" };
    const before = { ...formState };

    validateBookingFormState(formState);

    expect(formState).toEqual(before);
  });
});
