import { Link } from 'react-router-dom'
import { useAuth } from '../src/contexts/AuthContext'
import { useTheme } from '../src/contexts/ThemeContext'
import ThemeToggle from '../src/components/ThemeToggle'

function Header() {
    const { isAuthenticated, logout } = useAuth()
    const { darkMode } = useTheme()
    
    const handleLogout = async () => {
      await logout()
    }

    return (
        <header className={`${darkMode ? 'bg-black text-white' : 'bg-white text-black'} shadow-xl sticky top-0 z-50 transition-colors duration-300`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <h1 className="text-3xl font-bold">Kormacatron</h1>
            </div>
            <ul className="hidden md:flex space-x-8 font-medium text-lg">
              <li><Link to="/home" className="hover:text-emerald-400 transition duration-300 border-transparent border-1 rounded-md hover:border-emerald-400 p-1">Home</Link></li>
              <li><Link to="/courses" className="hover:text-emerald-400 transition duration-300 border-transparent border-1 rounded-md hover:border-emerald-400 p-1">Courses</Link></li>
              <li><Link to="/about" className="hover:text-emerald-400 transition duration-300 border-transparent border-1 rounded-md hover:border-emerald-400 p-1">About</Link></li>
            </ul>
            <div className="flex gap-3 items-center">
              <ThemeToggle />
              {isAuthenticated ? (
                <>
                  <Link to="/profile">
                    <button className={`${darkMode ? 'bg-white/20 hover:bg-white/30' : 'bg-black/10 hover:bg-black/20'} backdrop-blur-sm px-5 py-2 rounded-lg font-semibold transition duration-300`}>
                      Profile
                    </button>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className={`${darkMode ? 'bg-white/20 hover:bg-white/30' : 'bg-black/10 hover:bg-black/20'} backdrop-blur-sm px-5 py-2 rounded-lg font-semibold transition duration-300`}
                  >
                    Log Out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login">
                    <button className={`hidden md:block ${darkMode ? 'bg-slate-900 hover:bg-slate-700' : 'bg-black/10 hover:bg-black/20'} backdrop-blur-sm px-5 py-2 rounded-lg font-semibold transition duration-300 cursor-pointer`}>
                      Log In
                    </button>
                  </Link>
                  <Link to="/signup">
                    <button className={`${darkMode ? 'bg-white text-black' : 'bg-gray-300 text-gray-800'} px-6 py-2 rounded-lg font-semibold hover:shadow-xl hover:-translate-y-0.5 transition duration-300 cursor-pointer`}>
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
