const API_BASE = "https://eashwa-live-tracking-backend.vercel.app/api";

// Authentication
export async function loginWithPhone(phone: string) {
  // Mock login for Eashwa Live Tracking
  return { success: true, message: "OTP sent" };
}

export async function verifyOTP(phone: string, otp: string) {
  // Mock OTP verify
  return { success: true, token: "mock-token-123", user: { role: "admin" } };
}

export async function getMyProfile(token: string) {
  return { success: true, profile: { name: "Admin User", role: "admin" } };
}

// Employees
export async function getEmployees(token: string, search = "", dept = "") {
  return { success: true, data: [] };
}

export async function getEmployeeById(token: string, id: string) {
  return { success: true, data: null };
}

// Dashboard Stats
export async function getAdminDashboard(token: string) {
  return { success: true, stats: {} };
}

// Map & Tracking
export async function getLiveLocations(token: string) {
  return { success: true, locations: [] };
}

// Attendance & Leave
export async function getAttendance(token: string, month: string) {
  return { success: true, data: [] };
}

export async function getLeaveRequests(token: string) {
  return { success: true, data: [] };
}

// Reports & Performance
export async function getReports(token: string) {
  return { success: true, data: [] };
}

export async function getPerformance(token: string) {
  return { success: true, data: [] };
}

// Upload
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