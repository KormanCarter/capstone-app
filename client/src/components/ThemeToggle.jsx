import { useTheme } from '../contexts/ThemeContext';

export default function ThemeToggle() {
  const { darkMode, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`relative p-2 rounded-lg transition-all duration-300 border ${
        darkMode 
          ? 'bg-slate-800 border-slate-600 hover:bg-slate-700' 
          : 'bg-slate-200 border-slate-300 hover:bg-slate-300'
      }`}
      aria-label="Toggle theme"
      type="button"
    >
      {/* Toggle switch icon */}
      <svg 
        className={`w-6 h-6 transition-colors ${darkMode ? 'text-white' : 'text-gray-800'}`}
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        {darkMode ? (
          // Switch toggled to the right (dark mode)
          <g>
            <rect x="4" y="9" width="16" height="6" rx="3" strokeWidth="2" fill="none" />
            <circle cx="15" cy="12" r="2.5" fill="currentColor" />
          </g>
        ) : (
          // Switch toggled to the left (light mode)
          <g>
            <rect x="4" y="9" width="16" height="6" rx="3" strokeWidth="2" fill="none" />
            <circle cx="9" cy="12" r="2.5" fill="currentColor" />
          </g>
        )}
      </svg>
    </button>
  );
}
