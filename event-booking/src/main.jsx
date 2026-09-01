/**
 * ==============================================================================
 * ไฟล์: src/main.jsx
 * หน้าที่: จุดเริ่มต้นการเรนเดอร์ React App เข้าสู่ DOM Element (#root) ใน index.html
 * ==============================================================================
 */

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
