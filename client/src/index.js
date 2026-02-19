import React from 'react';
import ReactDOM from 'react-dom/client';
import './api'; // Apply REACT_APP_API_URL so client can talk to your server
import './index.css';
import App from './App';

// Suppress noisy ResizeObserver loop errors from the browser/Monaco/editor.
// This is a known Chrome issue where ResizeObserver keeps firing during layout
// and React's dev overlay shows it as a runtime error even though it is harmless.
// We stop the error event from bubbling into the overlay, while still letting
// other, real errors surface normally.
window.addEventListener(
  'error',
  (event) => {
    const msg = event.message || '';
    if (
      msg.includes('ResizeObserver loop completed with undelivered notifications.') ||
      msg.includes('ResizeObserver loop limit exceeded')
    ) {
      event.stopImmediatePropagation();
    }
  },
  true // capture phase so we intercept before React dev overlay
);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
