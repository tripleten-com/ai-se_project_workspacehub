import axios from "axios";
import type { AxiosResponse } from "axios";
import type { ApiResponse } from "../types/api";

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
    let message = "Request failed";

    if (axios.isAxiosError(error)) {
      const responseData = error.response?.data as
        { error?: { message?: string } } | undefined;

      message = responseData?.error?.message ?? error.message ?? message;
    } else if (error instanceof Error) {
      message = error.message;
    }

    return Promise.reject(new Error(message));
  },
);

export const unwrapResponse = async <T>(
  request: Promise<AxiosResponse<ApiResponse<T>>>,
) => {
  const response = await request;

  if (!response.data.success || response.data.data === null) {
    throw new Error(response.data.error?.message ?? "Request failed");
  }

  return response.data.data;
};
