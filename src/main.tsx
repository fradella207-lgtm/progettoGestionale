import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Disable gesture zoom (pinch-to-zoom) and double tap zoom across mobile browsers
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    if (
      event &&
      event.message &&
      (event.message.indexOf('$$typeof') !== -1 ||
       (event.message.indexOf('SecurityError') !== -1 && event.message.indexOf('cross-origin') !== -1))
    ) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }, true);

  document.addEventListener('gesturestart', (e) => {
    e.preventDefault();
  }, { passive: false });
  document.addEventListener('gesturechange', (e) => {
    e.preventDefault();
  }, { passive: false });
  document.addEventListener('gestureend', (e) => {
    e.preventDefault();
  }, { passive: false });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
