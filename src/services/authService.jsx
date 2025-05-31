import { API_CONFIG, STORAGE_KEYS } from '../config/config';

// Función para solicitar código de verificación
export const requestVerificationCode = async (email) => {
  const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.REQUEST_CODE}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email })
  });

  return response.json();
};

// Función para verificar el código
export const verifyCode = async (email, code) => {
  const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.VERIFY_CODE}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      code: parseInt(code)
    }),
  });

  return response.json();
};

// Función para registrar usuario
export const registerUser = async (userData) => {
  const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USERS.REGISTER}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: userData.email,
      name: userData.name,
      userType: "PERSONAL"
    }),
  });

  return response.json();
};

// Función para verificar si hay token y email
export const isAuthenticated = () => {
  return localStorage.getItem(STORAGE_KEYS.TOKEN) && localStorage.getItem(STORAGE_KEYS.USER_EMAIL);
};

// Función para guardar credenciales
export const saveCredentials = (token, email) => {
  localStorage.setItem(STORAGE_KEYS.TOKEN, token);
  localStorage.setItem(STORAGE_KEYS.USER_EMAIL, email);
};

// Función para obtener credenciales
export const getCredentials = () => {
  return {
    token: localStorage.getItem(STORAGE_KEYS.TOKEN),
    email: localStorage.getItem(STORAGE_KEYS.USER_EMAIL)
  };
}; 