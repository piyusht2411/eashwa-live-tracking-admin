const API_BASE = "https://eahwa-live-trakcing-backend-pcma.vercel.app/api";

// ─── Auth ────────────────────────────────────────────────────────────────────

export async function loginUser(userName: string, password: string) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userName, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Login failed");
  return data; // { ok, token, user: { id, name, email, role } }
}

export interface RegisterEmployeePayload {
  name: string;
  email: string;
  password: string;
  phone: string;
  department: string;
  role: "admin" | "hr" | "manager" | "employee";
  employeeId?: string;
  post?: string;
  address?: string;
  aadhaarNumber?: number | null;
  managerId?: string;
  joiningDate?: string;
}

export async function registerEmployee(
  payload: RegisterEmployeePayload,
  profilePictureFile: File | null,
  token: string
) {
  const formData = new FormData();

  formData.append("name", payload.name);
  formData.append("email", payload.email);
  formData.append("password", payload.password);
  formData.append("phone", payload.phone);
  formData.append("department", payload.department);
  formData.append("role", payload.role);

  if (payload.employeeId) formData.append("employeeId", payload.employeeId);
  if (payload.post) formData.append("post", payload.post);
  if (payload.address) formData.append("address", payload.address);
  if (payload.aadhaarNumber !== undefined && payload.aadhaarNumber !== null) {
    formData.append("aadhaarNumber", payload.aadhaarNumber.toString());
  }
  if (payload.managerId) formData.append("managerId", payload.managerId);
  if (payload.joiningDate) formData.append("joiningDate", payload.joiningDate);

  if (profilePictureFile) {
    formData.append("profilePicture", profilePictureFile);
  }

  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Registration failed");
  return data;
}

// ─── Employees ───────────────────────────────────────────────────────────────

export async function getEmployees(token: string, search = "", dept = "") {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (dept) params.set("department", dept);
  const res = await fetch(`${API_BASE}/users?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to fetch employees");
  return data;
}

export async function getEmployeeById(token: string, id: string) {
  const res = await fetch(`${API_BASE}/users/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to fetch employee");
  return data;
}

// ─── Dashboard Stats ─────────────────────────────────────────────────────────

export async function getAdminDashboard(token: string, period = "today") {
  const res = await fetch(`${API_BASE}/admin/dashboard?period=${period}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to fetch dashboard");
  return data;
}

// ─── Map & Tracking ──────────────────────────────────────────────────────────

export async function getLiveLocations(token: string) {
  const res = await fetch(`${API_BASE}/admin/tracking/live`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to fetch locations");
  return data;
}

export async function getLocationHistory(token: string, userId: string, date?: string) {
  let url = `${API_BASE}/admin/tracking/history/${userId}`;
  if (date) {
    url += `?date=${date}`;
  }
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to fetch location history");
  return data;
}

// ─── Attendance & Leave ──────────────────────────────────────────────────────

export async function getAttendance(token: string, date?: string) {
  const url = date
    ? `${API_BASE}/attendance?date=${date}`
    : `${API_BASE}/attendance`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to fetch attendance");
  return data;
}

export async function createLeave(token: string, payload: { userId: string; type: string; date: string; reason?: string }) {
  const res = await fetch(`${API_BASE}/leaves`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to create leave");
  return data;
}

export async function getLeaveRequests(token: string) {
  const res = await fetch(`${API_BASE}/leaves`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to fetch leave requests");
  return data;
}

export async function deleteLeave(token: string, leaveId: string) {
  const res = await fetch(`${API_BASE}/leaves/${leaveId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to delete leave");
  return data;
}

export async function updateLeaveStatus(token: string, leaveId: string, status: "approved" | "rejected") {
  const res = await fetch(`${API_BASE}/leaves/${leaveId}/status`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ status }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to update leave status");
  return data;
}

// ─── Reports & Performance ───────────────────────────────────────────────────

export async function getReports(token: string) {
  const res = await fetch(`${API_BASE}/reports`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to fetch reports");
  return data;
}

export async function getPerformance(token: string) {
  const res = await fetch(`${API_BASE}/performance`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to fetch performance");
  return data;
}

export async function getAnomalies(token: string) {
  const res = await fetch(`${API_BASE}/anomalies`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to fetch anomalies");
  return data;
}

export async function getGeofences(token: string, department?: string) {
  let url = `${API_BASE}/geofence`;
  if (department) url += `?department=${department}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to fetch geofences");
  // Assuming response structure { success: true, data: [] } or just [] depending on backend structure we plan. Spec says Array of Geofence objects
  return data.data || data;
}

export async function createGeofence(token: string, payload: any) {
  const res = await fetch(`${API_BASE}/geofence`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to create geofence");
  return data;
}

export async function updateGeofence(token: string, id: string, payload: any) {
  const res = await fetch(`${API_BASE}/geofence/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to update geofence");
  return data;
}

export async function getStockSubmissions(token: string, start?: string, end?: string) {
  const params = new URLSearchParams();
  if (start) params.set("start", start);
  if (end) params.set("end", end);

  const res = await fetch(`${API_BASE}/stock?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to fetch stock submissions");
  return data;
}

export async function exportReport(token: string, type: "attendance" | "performance" | "anomalies", startDate?: string, endDate?: string) {
  const params = new URLSearchParams({ type });
  if (startDate) params.set("startDate", startDate);
  if (endDate) params.set("endDate", endDate);

  const res = await fetch(`${API_BASE}/reports/export?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to export report");
  }

  // Expecting a blob (file download) back from the server
  return await res.blob();
}

// ─── Upload ──────────────────────────────────────────────────────────────────

export async function uploadImage(file: File): Promise<string> {
  const token = localStorage.getItem("authToken");
  const formData = new FormData();
  formData.append("images", file);

  const res = await fetch(`${API_BASE}/images/upload-images`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  if (!res.ok) throw new Error("Image upload failed");
  const data = await res.json();
  return data.images[0] || "";
}

export async function getEmployeeLocationHistory(token: string, userId: string) {
  const res = await fetch(`${API_BASE}/admin/tracking/history/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to fetch location history");
  return data;
}

export async function getVisitRecords(token: string, params?: { employeeName?: string; managerName?: string; month?: string; date?: string }) {
  const q = new URLSearchParams();
  if (params?.employeeName) q.set("employeeName", params.employeeName);
  if (params?.managerName) q.set("managerName", params.managerName);
  if (params?.month) q.set("month", params.month);
  if (params?.date) q.set("date", params.date);
  const res = await fetch(`${API_BASE}/visits?${q}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to fetch visits");
  return data;
}

export async function getBreakRecords(token: string) {
  const res = await fetch(`${API_BASE}/breaks/all`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to fetch break records");
  return data;
}

export const fetchAdminsAndManagers = async () => {
  const response = await fetch(`${API_BASE}/users/managers`);
  if (!response.ok) throw new Error('Failed to fetch admins/managers');
  return response.json();
};

// ─── Employees ───────────────────────────────────────────────────────────────

// UPDATED: now supports profile picture upload (FormData) + works with PATCH/PUT
export async function updateEmployee(
  token: string,
  id: string,
  payload: any,
  profilePictureFile: File | null = null
) {
  let body: BodyInit;
  const headers: HeadersInit = { Authorization: `Bearer ${token}` };

  if (profilePictureFile) {
    const formData = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });
    formData.append("profilePicture", profilePictureFile);
    body = formData;
    // browser automatically sets multipart/form-data
  } else {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(payload);
  }

  const res = await fetch(`${API_BASE}/employees/${id}`, {
    method: "PATCH",           // backend handles both PUT and PATCH
    headers,
    body,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to update employee");
  return data;
}

// NEW: Delete (soft delete)
export async function deleteEmployee(token: string, id: string) {
  const res = await fetch(`${API_BASE}/employees/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to delete employee");
  return data;
}
export async function getHeatmapData(token: string, period = "today") {
  const res = await fetch(`${API_BASE}/heatmap?period=${period}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch heatmap data');
  return data;
}
