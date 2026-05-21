import { ApiClient } from "@futuredesk/shared";

export const apiClient = new ApiClient({
  baseUrl: import.meta.env.VITE_API_URL ?? "http://localhost:4000",
  getToken: () => window.localStorage.getItem("futuredesk.token")
});
