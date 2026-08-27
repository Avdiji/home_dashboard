import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './theme/tokens.css'
import './index.css'
import './core/i18n' // i18n bootstrap — must run before App renders
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
