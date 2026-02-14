/**
 * Axios config:
 * - REACT_APP_API_URL: when set, client talks to your deployed server.
 * - REACT_APP_API_KEY: when set, sent as X-API-Key (required if server has API_KEY).
 */
import axios from 'axios';

const baseURL = process.env.REACT_APP_API_URL || '';
if (baseURL) {
  axios.defaults.baseURL = baseURL;
}

const apiKey = process.env.REACT_APP_API_KEY;
if (apiKey) {
  axios.defaults.headers.common['X-API-Key'] = apiKey;
}

export default axios;
