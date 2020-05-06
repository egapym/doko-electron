import { API_URL, AUTH_REQUEST_HEADERS } from '../define';

export const officeInfoAPI = {
  getRestroomUsage: async () => {
    return await fetch(`${API_URL}/restrooms`, {
      method: 'GET',
      headers: AUTH_REQUEST_HEADERS,
    });
  },

  getOfficeInfo: async () => {
    return await fetch(`${API_URL}/officeInfo`, {
      method: 'GET',
      headers: AUTH_REQUEST_HEADERS,
    });
  },
};