import axios, { type AxiosResponse } from "axios";

type ApiEnvelope<T> = {
  data: T;
  message?: string;
};

const baseURL = `${import.meta.env.VITE_API_URL ?? "http://localhost:5001"}/api`;

export const api = axios.create({
  baseURL,
});

export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    return;
  }

  delete api.defaults.headers.common.Authorization;
};

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (!axios.isAxiosError(error)) {
      return Promise.reject(new Error("Request failed"));
    }

    const payload = error.response?.data as
      | {
          message?: string;
          error?: { message?: string };
        }
      | undefined;

    const message =
      payload?.error?.message ??
      payload?.message ??
      error.message ??
      "Request failed";

    return Promise.reject(new Error(message));
  },
);

export const unwrapResponse = async <T>(
  request: Promise<AxiosResponse<ApiEnvelope<T>>>,
): Promise<T> => {
  try {
    const response = await request;
    return response.data.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const payload = error.response?.data as
        | {
            message?: string;
          }
        | undefined;

      const message = payload?.message ?? error.message ?? "Request failed";

      throw new Error(message);
    }

    if (error instanceof Error) {
      throw error;
    }

    throw new Error("Request failed");
  }
};
