import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const originalConsoleError = console.error;
console.error = (...args) => {
  originalConsoleError(...args);
  try {
    fetch('/api/log-error', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: "Console Error", args: args.map(a => String(a)) })
    }).catch(() => {});
  } catch (e) {}
};

window.addEventListener('error', (event) => {
  try {
    fetch('/api/log-error', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: "Uncaught Error", error: event.message, stack: event.error?.stack })
    }).catch(() => {});
  } catch (e) {}
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);


