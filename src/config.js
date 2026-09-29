/**
 * Central Configuration for NextGenn Gaming Portal Frontend
 */

export const CONFIG = {
  // Base URL for Backend REST API
  API_BASE: (import.meta.env.VITE_API_BASE || 'http://localhost:5000/api').replace(/\/+$/, ''),


  // Admin Control Center Portal URL
  ADMIN_URL: import.meta.env.VITE_ADMIN_URL || 'http://localhost:5174',

  // LocalStorage Keys
  STORAGE_KEYS: {
    USER: 'nextgenn_user',
    TOKEN: 'nextgenn_token',
    FAVORITES: 'nextgenn_favorites',
    RECENT: 'nextgenn_recent',
    CACHED_GAMES: 'nextgenn_cached_games',
    CACHED_CATEGORIES: 'nextgenn_cached_categories'
  }
};

export default CONFIG;
