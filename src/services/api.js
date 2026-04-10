export const getAuthToken = () => localStorage.getItem('token');
export const setAuthToken = (token) => localStorage.setItem('token', token);
export const removeAuthToken = () => localStorage.removeItem('token');

/**
 * Standard fetch wrapper that includes Auth header and parses JSON
 */
export const apiFetch = async (endpoint, options = {}) => {
  const token = getAuthToken();
  const url = endpoint.startsWith('/api') ? endpoint : `/api${endpoint}`;

  const headers = {
    ...options.headers,
  };

  // Only add Content-Type if it's not FormData (multer needs browser to set boundary)
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  let data = {};
  const contentType = response.headers.get('content-type');
  
  try {
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      data = { message: text || `Error ${response.status}: Server returned no data.` };
    }
  } catch (err) {
      data = { message: 'Failed to parse response from server.' };
  }

  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }

  return data;
};
