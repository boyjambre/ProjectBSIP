import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import Login from './components/Login';
import Register from './components/Register';
import './index.css';

// Pastikan elemen dengan ID 'root' sudah ada di index.html
const rootElement = document.getElementById('root');

// Verifikasi jika elemen ditemukan
if (rootElement) {
    ReactDOM.createRoot(rootElement).render(
        <React.StrictMode>
            <App />
        </React.StrictMode>
    );
} else {
    console.error("Error: Elemen dengan ID 'root' tidak ditemukan di index.html.");
}
