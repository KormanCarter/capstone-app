import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Auth0Provider } from '@auth0/auth0-react'
import './index.css'
import './App.css'
import App from './App.jsx'
import CoursesPage from './pages/courses.jsx'
import AboutPage from './pages/About.jsx'
import SignUp from './pages/SignUp.jsx'
import Login from './pages/Login.jsx'
import AuthCallback from './components/AuthCallback.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Auth0Provider
      domain="dev-olwlskuks7wo25q0.us.auth0.com"
      clientId="bzBFRcsmwFKw9rpG7qajD2SyY6KgbcJz"
      authorizationParams={{
        redirect_uri: `${window.location.origin}/callback`
      }}
      cacheLocation="localstorage"
    >
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<App />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          <Route path="/callback" element={<AuthCallback />} />
        </Routes>
      </BrowserRouter>
    </Auth0Provider>
  </StrictMode>,
)
