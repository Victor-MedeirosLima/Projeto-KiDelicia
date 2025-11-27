import { getToken } from "../auth.js";

export function requireAdminAuth() {
  const token = getToken();

  if (!token) {
    alert("Você precisa fazer login para acessar a área administrativa.");
    window.location.href = "admin-login.html";
    return false;
  }

  return true;
}
