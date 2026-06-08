import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './App.css'

// ========================================
// React 앱 진입점
// ========================================
// index.html의 <div id="root">에 React 앱을 렌더링합니다.
// 이 파일은 빌드 시 번들링되어 dist 폴더에 생성됩니다.

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
