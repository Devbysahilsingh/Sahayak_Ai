const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";
export const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");
const SESSION_KEYS = {
  citizen: {
    token: "sahayak_citizen_token",
    user: "sahayak_citizen_user",
  },
  admin: {
    token: "sahayak_admin_token",
    user: "sahayak_admin_user",
  },
};

function getSessionScope(scope) {
  if (scope) return scope;
  if (typeof window !== "undefined" && (window.location.pathname.startsWith("/admin") || window.location.pathname.startsWith("/officer"))) {
    return "admin";
  }
  return "citizen";
}

export function resolveMediaUrl(url) {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${API_ORIGIN}${url.startsWith("/") ? "" : "/"}${url}`;
}

export function getToken(scope) {
  const key = SESSION_KEYS[getSessionScope(scope)].token;
  return localStorage.getItem(key) || "";
}

export function setToken(token, scope) {
  if (token) {
    localStorage.setItem(SESSION_KEYS[getSessionScope(scope)].token, token);
  }
}

export function getCurrentUser(scope) {
  const raw = localStorage.getItem(SESSION_KEYS[getSessionScope(scope)].user);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setCurrentUser(user, scope) {
  if (user) {
    localStorage.setItem(SESSION_KEYS[getSessionScope(scope)].user, JSON.stringify(user));
  }
}

export function clearSession(scope) {
  const keys = SESSION_KEYS[getSessionScope(scope)];
  localStorage.removeItem(keys.token);
  localStorage.removeItem(keys.user);
}

async function request(path, options = {}) {
  const isFormData = options.body instanceof FormData;
  const headers = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(options.headers || {}),
  };
  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || "Request failed");
  }
  return data;
}

export const api = {
  health: () => request("/health/"),
  sendOtp: (mobileNumber) =>
    request("/auth/send-otp/", {
      method: "POST",
      body: JSON.stringify({ mobile_number: mobileNumber }),
    }),
  verifyOtp: (mobileNumber, otp) =>
    request("/auth/verify-otp/", {
      method: "POST",
      body: JSON.stringify({ mobile_number: mobileNumber, otp }),
    }),
  createComplaint: (payload) => {
    if (payload.attachments?.length) {
      const formData = new FormData();
      Object.entries(payload).forEach(([key, value]) => {
        if (key === "attachments" || key === "location") return;
        if (value !== undefined && value !== null) {
          formData.append(key, value);
        }
      });
      payload.attachments.forEach((file) => formData.append("attachments", file));
      return request("/complaints/", {
        method: "POST",
        body: formData,
      });
    }
    return request("/complaints/", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  transcribeVoice: async (audioBlob, filename = "complaint-voice.webm") => {
    const formData = new FormData();
    formData.append("audio", audioBlob, filename);
    const headers = {};
    const token = getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    const response = await fetch(`${API_BASE_URL}/voice/transcribe/`, {
      method: "POST",
      headers,
      body: formData,
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error || "Voice transcription failed");
    }
    return data;
  },
  listComplaints: (params = {}) => {
    const query = new URLSearchParams(
      Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== ""),
    ).toString();
    return request(`/complaints/${query ? `?${query}` : ""}`);
  },
  getComplaint: (id) => request(`/complaints/${id}/`),
  sendAdminResponse: (id, payload) =>
    request(`/complaints/${id}/admin-response/`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  escalateComplaint: (id, escalatedTo = "higher_authority") =>
    request(`/complaints/${id}/escalate/`, {
      method: "POST",
      body: JSON.stringify({ escalated_to: escalatedTo }),
    }),
  markFalseComplaint: (id, comment, evidenceFiles = []) => {
    const formData = new FormData();
    formData.append("type", "false_complaint");
    formData.append("is_false_complaint", "true");
    formData.append("comment", comment);
    evidenceFiles.forEach((file) => formData.append("evidence", file));
    return request(`/complaints/${id}/feedback/`, {
      method: "POST",
      body: formData,
    });
  },
  submitComplaintFeedback: (id, payload) =>
    request(`/complaints/${id}/feedback/`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  processOverdueComplaints: () =>
    request("/complaints/process-overdue/", {
      method: "POST",
    }),
  listNotifications: () => request("/notifications/"),
  listActiveWork: () => request("/active-work/"),
  createActiveWork: (payload) =>
    request("/active-work/", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  listDepartments: () => request("/departments/"),
  listUsers: () => request("/users/"),
  dashboardStats: () => request("/dashboard/stats/"),
  dashboardAnalytics: (params = {}) => {
    const query = new URLSearchParams(
      Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== ""),
    ).toString();
    return request(`/dashboard/analytics/${query ? `?${query}` : ""}`);
  },
  submitClassificationFeedback: (payload) =>
    request("/feedback/classification/", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  geoSearch: (query) => request(`/geo/search/?q=${encodeURIComponent(query)}`),
  geoReverse: (lat, lon) => request(`/geo/reverse/?lat=${lat}&lon=${lon}`),
};
