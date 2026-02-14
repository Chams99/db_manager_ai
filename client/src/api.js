/**
 * Axios instance config: use REACT_APP_API_URL when set so the client
 * can talk to your deployed server from anywhere (not just localhost).
 * If unset, requests are relative (dev proxy to localhost:5000).
 */
import axios from 'axios';

const baseURL = process.env.REACT_APP_API_URL || '';
if (baseURL) {
  axios.defaults.baseURL = baseURL;
}

export default axios;
