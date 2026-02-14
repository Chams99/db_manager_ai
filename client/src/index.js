import React from 'react';
import ReactDOM from 'react-dom/client';
import './api'; // Apply REACT_APP_API_URL so client can talk to your server
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
