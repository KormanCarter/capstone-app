import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Header from '../../utilities/Header'
import Footer from '../../utilities/Footer'

export default function Login() {
  const { login, loginWithGoogle, isAuthenticated, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/home')
    }
  }, [isAuthenticated, navigate])

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search)
    if (searchParams.get('error') === 'auth_failed') {
      setError('Google sign-in failed. Please try again.')
    }
  }, [location.search])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    // Clear error when user starts typing
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.email || !formData.password) {
      setError('Please fill in all fields')
      return
    }

    setIsSubmitting(true)
    setError('')

    const result = await login(formData.email, formData.password)
    if (result.success) {
      navigate('/home')
    } else {
      setError(result.error || 'Login failed. Please try again.')
    }

    setIsSubmitting(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-gray-300">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <Header />

      {/* Login Form Section */}
      <section className="py-16">
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-900 rounded-2xl shadow-xl p-8 border border-slate-600">
            <h2 className="text-3xl font-bold text-gray-50 mb-6 text-center">Log In</h2>

            {error && (
              <div className="mb-4 p-3 rounded-lg border border-red-500/40 bg-red-950 text-red-200 text-sm">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-50 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-white bg-slate-800"
                  placeholder="john.doe@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-50 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-white bg-slate-800"
                  placeholder="••••••••"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-emerald-600 text-white py-3 rounded-lg font-bold hover:bg-emerald-700 hover:shadow-xl transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Logging in...' : 'Log In'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-300">
                Don't have an account?{' '}
                <Link to="/signup" className="text-emerald-600 font-semibold hover:text-emerald-700">
                  Sign Up
                </Link>
              </p>
            </div>

            {/* Divider */}
            <div className="mt-6 flex items-center">
              <div className="flex-1 border-t border-slate-600"></div>
              <span className="px-4 text-gray-400 text-sm">OR</span>
              <div className="flex-1 border-t border-slate-600"></div>
            </div>

            {/* Social Login Buttons */}
            <div className="mt-6">
              <button 
                onClick={loginWithGoogle}
                type="button"
                className="w-full flex items-center justify-center px-4 py-3 border border-slate-600 rounded-lg hover:bg-slate-700 transition duration-300"
              >
                <span className="text-sm font-semibold text-gray-50">Continue with Google</span>
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </section>
    </div>
  )
}
