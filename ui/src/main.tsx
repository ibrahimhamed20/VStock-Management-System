import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './features/core/components/App.tsx'
import './index.css'
import './features/core/components/App.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)
