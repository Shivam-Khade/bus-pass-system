const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:8082';

// Login function
export const login = async (email, password) => {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Login failed');
  }

  const data = await response.json();

  // Store full user data including token
  localStorage.setItem('user', JSON.stringify(data));

  return data;
};

// Send OTP function
export const sendOtp = async (email) => {
  const response = await fetch(`${BASE_URL}/auth/send-otp?email=${encodeURIComponent(email)}`, {
    method: 'POST',
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Failed to send OTP');
  }

  return await response.text();
};

// Register function
export const register = async (userData) => {
  const response = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Registration failed');
  }

  return await response.text();
};

// Logout function
export const logout = () => {
  localStorage.removeItem('user');
  window.location.href = '/';
};

// Get current user
export const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return !!localStorage.getItem('user');
};
