import axios, { isAxiosError } from "axios";
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
    const fallback = error instanceof Error ? error.message : "";
    const serverMessage = isAxiosError<ApiResponse<unknown> | undefined>(error)
      ? error.response?.data?.error?.message
      : undefined;
    const message = serverMessage || fallback || "Request failed";
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
