import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  authenticateGoogleToken: (token) =>
    api.post('/auth/google/token', { token }),
};

export const recordingsAPI = {
  getRecordings: () => api.get('/recordings'),
  createRecording: () => api.post('/recordings'),
  uploadChunk: (recordingId, chunkIndex, audioBlob) => {
    const formData = new FormData();
    formData.append('chunk_index', chunkIndex);
    formData.append('audio_chunk', audioBlob);
    
    return api.post(`/recordings/${recordingId}/chunks`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  pauseRecording: (recordingId) =>
    api.patch(`/recordings/${recordingId}/pause`),
  finishRecording: (recordingId) =>
    api.post(`/recordings/${recordingId}/finish`),
  getRecording: (recordingId) =>
    api.get(`/recordings/${recordingId}`),
};

export default api;
