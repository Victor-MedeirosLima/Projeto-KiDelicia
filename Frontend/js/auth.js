
import { loginRequest } from './api.js';

const TOKEN_KEY = 'kidelicia_token';

export async function login(email, password) {
  try {
    const resp = await loginRequest(email, password);
    if (resp && resp.token) {
      localStorage.setItem(TOKEN_KEY, resp.token);
      return resp;
    } else {
      throw new Error('Credenciais inválidas ou token não fornecido.');
    }
  } catch (err) {
    console.error('Erro ao autenticar:', err);
    throw new Error(err.message || 'Falha ao autenticar. Tente novamente.');
  }
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
}
