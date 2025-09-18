import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import maplibregl from 'maplibre-gl'

// Fix MapLibre GL WebWorker for sandboxed/CSP environment (Replit)
// This MUST be done before any map components are created
(async () => {
  try {
    // Use the CSP-compatible worker to avoid blob WebWorker creation issues
    const MapLibreWorker = await import('maplibre-gl/dist/maplibre-gl-csp-worker.js?worker')
    // @ts-ignore - workerClass exists but isn't typed
    maplibregl.workerClass = MapLibreWorker.default || MapLibreWorker
    console.log('✅ MapLibre CSP worker configured successfully')
  } catch (error) {
    console.error('❌ Failed to configure MapLibre CSP worker:', error)
    // Fallback: Try to set worker URL directly
    try {
      // @ts-ignore - workerUrl exists but isn't typed
      maplibregl.workerUrl = '/node_modules/maplibre-gl/dist/maplibre-gl-csp-worker.js'
      console.log('✅ MapLibre worker URL configured as fallback')
    } catch (fallbackError) {
      console.error('❌ Fallback worker configuration also failed:', fallbackError)
    }
  }
})()

// Global error handling
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  event.preventDefault();
});

window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
});

// Counter animation functionality
document.addEventListener("DOMContentLoaded", () => {
  try {
    const counters = document.querySelectorAll(".count");
    const speed = 200;

    counters.forEach(counter => {
      const updateCount = () => {
        try {
          const target = +(counter.getAttribute("data-target") || "0");
          const count = +(counter as HTMLElement).innerText || 0;
          const increment = target / speed;

          if (count < target) {
            (counter as HTMLElement).innerText = Math.ceil(count + increment).toString();
            setTimeout(updateCount, 1);
          } else {
            (counter as HTMLElement).innerText = target.toString();
          }
        } catch (error) {
          console.error('Counter animation error:', error);
        }
      };

      updateCount();
    });
  } catch (error) {
    console.error('Counter setup error:', error);
  }
});

// Initialize React app
const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(<App />);
} else {
  console.error('Root element not found');
}
