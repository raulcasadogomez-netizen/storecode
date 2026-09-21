import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { LanguageProvider } from './i18n/LanguageContext.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { SiteMediaProvider } from './context/SiteMediaContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <LanguageProvider>
        <SiteMediaProvider>
          <App />
        </SiteMediaProvider>
      </LanguageProvider>
    </ThemeProvider>
  </React.StrictMode>,
)


