import api from './api';

const TOKEN_KEY = 'delhi_portal_token';
const USER_KEY = 'delhi_portal_user';

export const authService = {
  login: async ({ email, password, rememberMe = true, role }) => {
    const response = await api.post('/auth/login', {
      email,
      password,
      rememberMe,
      role
    });

    const { user, token } = response.data?.data || {};

    if (token) {
      if (rememberMe) {
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        sessionStorage.removeItem(TOKEN_KEY);
        sessionStorage.removeItem(USER_KEY);
      } else {
        sessionStorage.setItem(TOKEN_KEY, token);
        sessionStorage.setItem(USER_KEY, JSON.stringify(user));
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      }
    }

    return response.data;
  },

  register: async (registrationData) => {
    const response = await api.post('/auth/register', registrationData);

    const { user, token } = response.data?.data || {};

    if (token) {
      // Default to localStorage for registered user
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }

    return response.data;
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      // Proceed with local clearance even if server network fails
      console.warn('[Logout Notice] Server logout endpoint unreachable, clearing client session.');
    } finally {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      sessionStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(USER_KEY);
    }
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    const user = response.data?.data?.user;
    if (user) {
      if (localStorage.getItem(TOKEN_KEY)) {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
      } else if (sessionStorage.getItem(TOKEN_KEY)) {
        sessionStorage.setItem(USER_KEY, JSON.stringify(user));
      }
    }
    return response.data;
  },

  getStoredToken: () => {
    return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY) || null;
  },

  getStoredUser: () => {
    try {
      const raw = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
};
