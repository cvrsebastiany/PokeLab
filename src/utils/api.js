const API_URL = import.meta.env.VITE_API_URL;

/**
 * Make authenticated API requests
 * The token is automatically sent via httpOnly cookie
 */
export async function apiRequest(endpoint, options = {}) {
  const defaultOptions = {
    credentials: 'include', // Always include cookies
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...defaultOptions,
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

/**
 * Logout user - clears cookie
 */
export async function logout() {
  try {
    await apiRequest('/auth/logout', { method: 'POST' });
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // Redirect to login
    window.location.href = '/pokelab/login';
  }
}

/**
 * Get current user info from backend
 */
export async function getCurrentUser() {
  try {
    return await apiRequest('/auth/me');
  } catch (error) {
    return null;
  }
}

/**
 * Check if user is authenticated by trying to fetch user data
 */
export async function isAuthenticated() {
  const user = await getCurrentUser();
  return user !== null;
}
