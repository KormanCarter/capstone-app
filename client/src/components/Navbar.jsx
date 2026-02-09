import { Link } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'

export default function Navbar() {
  const { isAuthenticated, user, logout, loginWithRedirect, isLoading } = useAuth0()

  const handleLogin = () => {
    loginWithRedirect()
  }

  const handleLogout = () => {
    logout({
      logoutParams: {
        returnTo: window.location.origin
      }
    })
  }

  return (
    <header className="bg-black text-white shadow-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex justify-between items-center py-4">
          <Link to="/home" className="flex items-center space-x-2 hover:opacity-80 transition">
            <div className="text-4xl">🎓</div>
            <h1 className="text-3xl font-bold">Kormaia</h1>
          </Link>
          <ul className="hidden md:flex space-x-8 font-medium text-lg">
            <li>
              <Link to="/home" className="hover:text-emerald-200 transition duration-300 border-transparent border-1 rounded-md hover:border-emerald-200 p-1">
                Home
              </Link>
            </li>
            <li>
              <Link to="/courses" className="hover:text-emerald-200 transition duration-300 border-transparent border-1 rounded-md hover:border-emerald-200 p-1">
                Courses
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-emerald-200 transition duration-300 border-transparent border-1 rounded-md hover:border-emerald-200 p-1">
                About
              </Link>
            </li>
          </ul>
          
          <div className="flex items-center gap-3">
            {!isLoading && (
              <>
                {isAuthenticated ? (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {user?.picture && (
                        <img 
                          src={user.picture} 
                          alt="Profile" 
                          className="w-8 h-8 rounded-full border-2 border-white/30"
                        />
                      )}
                      <span className="text-sm font-medium">
                        Hi, {user?.given_name || user?.name || 'User'}!
                      </span>
                    </div>
                    <button 
                      onClick={handleLogout}
                      className="bg-white/20 backdrop-blur-sm px-5 py-2 rounded-lg font-semibold hover:bg-white/30 transition duration-300"
                    >
                      Log Out
                    </button>
                  </div>
                ) : (
                  <>
                    <button 
                      onClick={handleLogin}
                      className="hidden md:block bg-white/20 backdrop-blur-sm px-5 py-2 rounded-lg font-semibold hover:bg-white/30 transition duration-300"
                    >
                      Log In
                    </button>
                    <Link to="/signup">
                      <button className="bg-white text-emerald-800 px-6 py-2 rounded-lg font-semibold hover:shadow-xl hover:-translate-y-0.5 transition duration-300">
                        Sign Up
                      </button>
                    </Link>
                  </>
                )}
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  )
}
