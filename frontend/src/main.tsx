import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import Button from './components/Button.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Button 
      label="Sign in with Google"
      onClick={() => {
        window.location.href = "http://localhost:3333/auth/google/redirect"
      }} 
      />
    <App />
  </StrictMode>,
)
