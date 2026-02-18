import { useAuth } from './contexts/AuthContext';
import Dashboard from './pages/Dashboard.jsx';
import Landing from './pages/Landing.jsx';

function App() {
  const { isAuthenticated, loading } = useAuth();

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-gray-400 text-xl">Loading...</p>
      </div>
    );
  }

  // Show Dashboard if logged in, Landing page if not
  return isAuthenticated ? <Dashboard /> : <Landing />;
}

export default App;
