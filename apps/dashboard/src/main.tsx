import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Clarity from '@microsoft/clarity'
import './index.css'
import App from './App.tsx'

// Microsoft Clarity — heatmaps & session recordings
Clarity.init("vtptoqsjih");

// Capture UTM params + referrer before SPA navigation loses them
import { captureAcquisitionSource } from './lib/acquisition';
captureAcquisitionSource();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
