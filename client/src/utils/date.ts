export const formatDateTime = (value: string | null | undefined) => {
  if (!value) {
    return "Not set";
  }

  return new Date(value).toLocaleString();
};

export const formatDateInput = (value: string | null | undefined) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export const formatDateTimeInput = (value: string | null | undefined) => {
  if (!value) {
    return "";
  }

  // datetime-local inputs expect local wall-clock time, not UTC.
  const date = new Date(value);
  const hours = `${date.getHours()}`.padStart(2, "0");
  const minutes = `${date.getMinutes()}`.padStart(2, "0");

  return `${formatDateInput(value)}T${hours}:${minutes}`;
};

export const toIsoDateTime = (localValue: string) => {
  return new Date(localValue).toISOString();
};
