import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.POSTBRIDGE_API_URL ?? 'https://api.post-bridge.com/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const apiKey = process.env.POSTBRIDGE_API_KEY;
  if (!apiKey) {
    throw new Error('POSTBRIDGE_API_KEY is not configured');
  }
  config.headers.Authorization = `Bearer ${apiKey}`;
  return config;
});

export default apiClient;
