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
  worker: {
    token: "sahayak_worker_token",
    user: "sahayak_worker_user",
  },
};

function getSessionScope(scope) {
  if (scope) return scope;
  if (typeof window !== "undefined") {
    const pathname = window.location.pathname;
    if (pathname.startsWith("/officer") || pathname.startsWith("/worker")) return "worker";
    if (pathname.startsWith("/admin")) return "admin";
  }
  return "citizen";
}

function getRequestScope(path, explicitScope) {
  if (explicitScope) return explicitScope;
  if (path.startsWith("/worker/") || path.startsWith("/auth/worker-signup/")) return "worker";
  if (path.startsWith("/admin/") || path.startsWith("/dashboard/") || path.startsWith("/users/") || path.startsWith("/active-work/") || path.startsWith("/officers/") || path.startsWith("/departments/")) return "admin";
  return getSessionScope();
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
  const { scope, ...fetchOptions } = options;
  const isFormData = fetchOptions.body instanceof FormData;
  const headers = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(fetchOptions.headers || {}),
  };
  const token = getToken(getRequestScope(path, scope));
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...fetchOptions,
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
  signupWorker: (payload) =>
    request("/auth/worker-signup/", {
      method: "POST",
      body: JSON.stringify(payload),
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
    const token = getToken("citizen");
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
  approveFalseReport: (id, note = "") =>
    request(`/admin/complaints/${id}/approve-false/`, {
      method: "POST",
      body: JSON.stringify({ note }),
    }),
  approveResolution: (id, note = "") =>
    request(`/admin/complaints/${id}/approve-resolution/`, {
      method: "POST",
      body: JSON.stringify({ note }),
    }),
  submitComplaintFeedback: (id, payload) =>
    request(`/complaints/${id}/feedback/`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  listWorkerComplaints: (view = "") =>
    request(`/worker/complaints/${view ? `?view=${encodeURIComponent(view)}` : ""}`),
  updateWorkerLocation: (payload) =>
    request("/worker/location/", {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  startWorkerComplaint: (id) =>
    request(`/worker/complaints/${id}/start/`, {
      method: "POST",
      body: JSON.stringify({}),
    }),
  submitWorkerFalseReport: (id, note, evidenceFile) => {
    const formData = new FormData();
    formData.append("note", note);
    if (evidenceFile) formData.append("evidence", evidenceFile);
    return request(`/worker/complaints/${id}/false-report/`, {
      method: "POST",
      body: formData,
    });
  },
  resolveWorkerComplaint: (id, note, evidenceFile) => {
    const formData = new FormData();
    formData.append("note", note);
    if (evidenceFile) formData.append("evidence", evidenceFile);
    return request(`/worker/complaints/${id}/resolve/`, {
      method: "POST",
      body: formData,
    });
  },
  requestWorkerMoreTime: (id, note) =>
    request(`/worker/complaints/${id}/more-time/`, {
      method: "POST",
      body: JSON.stringify({ note }),
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
  geoRoute: ({ fromLat, fromLon, toLat, toLon }) =>
    request(`/geo/route/?from_lat=${fromLat}&from_lon=${fromLon}&to_lat=${toLat}&to_lon=${toLon}&mode=drive`, { scope: "worker" }),
  geoSearch: (query) => request(`/geo/search/?q=${encodeURIComponent(query)}`),
  geoReverse: (lat, lon) => request(`/geo/reverse/?lat=${lat}&lon=${lon}`),
};






