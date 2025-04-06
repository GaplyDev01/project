import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Get the root element
const rootElement = document.getElementById('root');

// Make sure the root element exists
if (!rootElement) {
  console.error('Root element not found');
} else {
  try {
    // Create root and render app
    const root = createRoot(rootElement);
    
    // Render with error boundary
    root.render(
      <StrictMode>
        <App />
      </StrictMode>
    );
    
    console.log('Application successfully mounted');
  } catch (error) {
    console.error('Failed to render application:', error);
    
    // Display error to user if rendering fails
    rootElement.innerHTML = `
      <div style="padding: 20px; text-align: center;">
        <h2>Application Error</h2>
        <p>There was a problem loading the application. Please check the console for details.</p>
        <pre style="background: #f1f1f1; padding: 10px; overflow: auto; text-align: left;">${error}</pre>
      </div>
    `;
  }
}