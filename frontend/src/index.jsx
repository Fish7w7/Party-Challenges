import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/main.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  // Removemos temporariamente o StrictMode para evitar execuções duplas
  <App />
)