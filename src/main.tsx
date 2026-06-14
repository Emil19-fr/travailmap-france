import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { Analytics } from '@vercel/analytics/react'
import 'leaflet/dist/leaflet.css'
import './styles/global.css'
import './styles/components.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
    <Analytics />
  </React.StrictMode>,
)