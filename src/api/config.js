// Flip VITE_USE_MOCK to "false" in .env when your own backend is ready.
export const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
export const MOCK_LATENCY = 250; // ms, simulates network
