import { Link } from 'react-router-dom'
import { useAuth } from '../src/contexts/AuthContext'

function Header() {
    const { isAuthenticated, logout } = useAuth()

    const handleLogout = async () => {
      await logout()
    }

    return (
        <header className="bg-black text-white shadow-xl sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <h1 className="text-3xl font-bold">Kormacatron</h1>
            </div>
            <ul className="hidden md:flex space-x-8 font-medium text-lg">
              <li><Link to="/home" className="hover:text-emerald-200 transition duration-300  border-transparent border-1 rounded-md hover:border-emerald-200 p-1">Home</Link></li>
              <li><Link to="/courses" className="hover:text-emerald-200 transition duration-300 border-transparent border-1 rounded-md hover:border-emerald-200 p-1">Courses</Link></li>
              <li><Link to="/about" className="hover:text-emerald-200 transition duration-300 border-transparent border-1 rounded-md hover:border-emerald-200 p-1">About</Link></li>
            </ul>
            <div className="flex gap-3">
              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className="bg-white/20 backdrop-blur-sm px-5 py-2 rounded-lg font-semibold hover:bg-white/30 transition duration-300"
                >
                  Log Out
                </button>
              ) : (
                <>
                  <Link to="/login">
                    <button className="hidden md:block bg-white/20 backdrop-blur-sm px-5 py-2 rounded-lg font-semibold hover:bg-white/30 transition duration-300">
                      Log In
                    </button>
                  </Link>
                  <Link to="/signup">
                    <button className="bg-white text-emerald-800 px-6 py-2 rounded-lg font-semibold hover:shadow-xl hover:-translate-y-0.5 transition duration-300">
                      Sign Up
                    </button>
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      </header>
  )
}

export  default Header
