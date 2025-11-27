import { getToken } from "./auth.js";

export function requireAdminAuth() {
  const token = getToken();
  if (!token) {
    window.location.href = "loginAdmin.html";
  }
}
