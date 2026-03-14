import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { CurrencyProvider } from './context/CurrencyContext'
import { ThemeProvider } from './context/ThemeContext'
import { Toaster } from 'react-hot-toast'
import './index.css'
import './App.css'
import App from './App.jsx'

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <ThemeProvider>
      <AuthProvider>
        <CurrencyProvider>
          <CartProvider>
            <Toaster position="top-right" toastOptions={{
              style: { background: '#1a1a2e', color: '#fff', border: '1px solid #2a2a3e' }
            }} />
            <App />
          </CartProvider>
        </CurrencyProvider>
      </AuthProvider>
    </ThemeProvider>
  </BrowserRouter>
)
