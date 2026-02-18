import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'
import './App.css'
import App from './App.jsx'
import CoursesPage from './pages/Courses.jsx'
import AboutPage from './pages/About.jsx'
import SignUp from './pages/SignUp.jsx'
import Login from './pages/Login.jsx'
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx'
import ProfilePage from './pages/Profile.jsx'
import AdminPage from './pages/Admin.jsx'

function RequireAdmin({ children }) {
  const { isAdmin, loading } = useAuth()

  if (loading) {
    return null
  }

  if (!isAdmin) {
    return <Navigate to="/home" replace />
  }

  return children
}

createRoot(document.getElementById('root')).render(

  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<App />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/admin" element={<RequireAdmin><AdminPage /></RequireAdmin>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
)
