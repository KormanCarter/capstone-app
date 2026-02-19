import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Header from '../../utilities/Header'
import Footer from '../../utilities/Footer'
import { useTheme } from '../contexts/ThemeContext'

export default function SignUp() {
  const { register, loginWithGoogle, isAuthenticated, loading } = useAuth()
  const navigate = useNavigate()
  const { darkMode } = useTheme()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/home')
    }
  }, [isAuthenticated, navigate])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }

    setIsSubmitting(true)
    setError('')

    const result = await register(formData.email, formData.password, formData.name)
    if (result.success) {
      navigate('/home')
    } else {
      setError(result.error || 'Sign up failed. Please try again.')
    }

    setIsSubmitting(false)
  }

  if (loading) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-black text-white' : 'bg-white text-black'} flex items-center justify-center`}>
        <div className="text-gray-300">Loading...</div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-black text-white' : 'bg-white text-black'}`}>
      <Header />

      {/* Sign Up Form Section */}
      <section className="py-16">
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`${darkMode ? 'bg-slate-900' : 'bg-slate-200'} rounded-2xl shadow-xl p-8 border border-slate-600`}>
            <h2 className={`text-3xl font-bold ${darkMode ? 'text-gray-50' : 'text-gray-800'} mb-6 text-center`}>Create Account</h2>

            {error && (
              <div className="mb-4 p-3 rounded-lg border border-red-500/40 bg-red-950 text-red-200 text-sm">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className={`block text-sm font-semibold ${darkMode ? 'text-gray-50' : 'text-gray-800'} mb-2`}>
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${darkMode ? 'bg-slate-800 text-white' : 'bg-slate-100 text-black'}`}
                  placeholder="John Doe"
                  required
                />
              </div>

              <div>
                <label className={`block text-sm font-semibold ${darkMode ? 'text-gray-50' : 'text-gray-800'} mb-2`}>
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${darkMode ? 'bg-slate-800 text-white' : 'bg-slate-100 text-black'}`}
                  placeholder="john.doe@example.com"
                />
              </div>

              <div>
                <label className={`block text-sm font-semibold ${darkMode ? 'text-gray-50' : 'text-gray-800'} mb-2`}>
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${darkMode ? 'bg-slate-800 text-white' : 'bg-slate-100 text-black'}`}
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className={`block text-sm font-semibold ${darkMode ? 'text-gray-50' : 'text-gray-800'} mb-2`}>
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${darkMode ? 'bg-slate-800 text-white' : 'bg-slate-100 text-black'}`}
                  placeholder="••••••••"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-emerald-600 text-white py-3 rounded-lg font-bold hover:bg-emerald-700 hover:shadow-xl transition duration-300 cursor-pointer"
              >
                {isSubmitting ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Already have an account?{' '}
                <Link to="/login" className="text-emerald-600 font-semibold hover:text-emerald-700">
                  Log In
                </Link>
              </p>
            </div>

            <div className="mt-6 flex items-center">
              <div className="flex-1 border-t border-slate-600"></div>
              <span className="px-4 text-gray-400 text-sm">OR</span>
              <div className="flex-1 border-t border-slate-600"></div>
            </div>

            <div className="mt-6">
              <button
                onClick={loginWithGoogle}
                type="button"
                className={`w-full flex items-center justify-center px-4 py-3 border border-slate-600 rounded-lg ${darkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-300'} transition duration-400 cursor-pointer`}
              >
                <span className={`text-sm font-semibold ${darkMode ? 'text-gray-50' : 'text-gray-800'} cursor-pointer`}>Sign up with Google</span>
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </section>
    </div>
  )
}
