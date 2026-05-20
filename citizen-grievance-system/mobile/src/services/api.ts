import { useAuthStore } from "@/store/authStore";
import { ApiList, Complaint, DashboardStats, NotificationItem } from "@/types/domain";

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api";
export const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");

type RequestOptions = RequestInit & { token?: string };

function toFormData(payload: Record<string, any>) {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (key === "attachments" && Array.isArray(value)) {
      value.forEach((file) => formData.append("attachments", file as any));
      return;
    }
    if (typeof value === "object" && value.uri) {
      formData.append(key, value as any);
      return;
    }
    formData.append(key, String(value));
  });
  return formData;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const token = options.token ?? useAuthStore.getState().token;
  const isFormData = options.body instanceof FormData;
  const headers: HeadersInit = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || data.detail || "Request failed");
  }
  return data as T;
}

export const api = {
  health: () => request<{ status: string }>("/health/"),
  sendOtp: (mobile_number: string) =>
    request<{ dev_otp?: string; note?: string }>("/auth/send-otp/", {
      method: "POST",
      body: JSON.stringify({ mobile_number })
    }),
  verifyOtp: (mobile_number: string, otp: string) =>
    request<{ token: string; user: any }>("/auth/verify-otp/", {
      method: "POST",
      body: JSON.stringify({ mobile_number, otp })
    }),
  signupWorker: (payload: Record<string, unknown>) =>
    request<{ dev_otp?: string; note?: string }>("/auth/worker-signup/", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  listDepartments: () => request<ApiList<{ id: string; name: string }>>("/departments/"),
  listComplaints: (params: Record<string, string> = {}) => {
    const query = new URLSearchParams(params).toString();
    return request<ApiList<Complaint>>(`/complaints/${query ? `?${query}` : ""}`);
  },
  getComplaint: (id: string) => request<{ complaint: Complaint }>(`/complaints/${id}/`),
  createComplaint: (payload: Record<string, any>) => {
    const hasFiles = Array.isArray(payload.attachments) && payload.attachments.length > 0;
    return request<{ complaint: Complaint }>("/complaints/", {
      method: "POST",
      body: hasFiles ? toFormData(payload) : JSON.stringify(payload)
    });
  },
  submitComplaintFeedback: (id: string, payload: Record<string, unknown>) =>
    request(`/complaints/${id}/feedback/`, { method: "POST", body: JSON.stringify(payload) }),
  listNotifications: () => request<ApiList<NotificationItem>>("/notifications/"),
  dashboardStats: () => request<DashboardStats>("/dashboard/stats/"),
  listWorkerComplaints: (view = "") => request<ApiList<Complaint>>(`/worker/complaints/${view ? `?view=${view}` : ""}`),
  updateWorkerLocation: (payload: Record<string, unknown>) =>
    request("/worker/location/", { method: "PATCH", body: JSON.stringify(payload) }),
  startWorkerComplaint: (id: string) => request(`/worker/complaints/${id}/start/`, { method: "POST", body: JSON.stringify({}) }),
  resolveWorkerComplaint: (id: string, note: string, evidence?: any) =>
    request(`/worker/complaints/${id}/resolve/`, { method: "POST", body: toFormData({ note, evidence }) }),
  requestWorkerMoreTime: (id: string, note: string) =>
    request(`/worker/complaints/${id}/more-time/`, { method: "POST", body: JSON.stringify({ note }) }),
  geoSearch: (query: string) => request(`/geo/search/?q=${encodeURIComponent(query)}`),
  geoReverse: (lat: number, lon: number) => request(`/geo/reverse/?lat=${lat}&lon=${lon}`),
  transcribeVoice: (audio: any) =>
    request<{ text?: string; transcript?: string }>("/voice/transcribe/", {
      method: "POST",
      body: toFormData({ audio })
    })
};

export function resolveMediaUrl(url?: string) {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${API_ORIGIN}${url.startsWith("/") ? "" : "/"}${url}`;
}
