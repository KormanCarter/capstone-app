import { useTheme } from '../contexts/ThemeContext';

export default function ThemeToggle() {
  const { darkMode, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`group relative inline-flex h-8 w-16 items-center rounded-full border px-1 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/60 ${
        darkMode
          ? 'bg-slate-900 border-slate-600 hover:border-slate-500'
          : 'bg-slate-200 border-slate-300 hover:border-slate-400'
      }`}
      aria-label="Toggle theme"
      aria-pressed={darkMode}
      type="button"
    >
      <span
        className={`absolute left-2 transition-all duration-300 ${darkMode ? 'opacity-0 scale-75' : 'opacity-100 scale-100'}`}
        aria-hidden="true"
      >
        <svg className="w-3.5 h-3.5 text-amber-500" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12Zm0-16a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0V3a1 1 0 0 1 1-1Zm0 18a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0v-1a1 1 0 0 1 1-1Zm10-8a1 1 0 0 1-1 1h-1a1 1 0 1 1 0-2h1a1 1 0 0 1 1 1ZM5 12a1 1 0 0 1-1 1H3a1 1 0 1 1 0-2h1a1 1 0 0 1 1 1Zm13.07-6.07a1 1 0 0 1 0 1.41l-.7.71a1 1 0 1 1-1.42-1.41l.71-.71a1 1 0 0 1 1.41 0ZM8.05 15.95a1 1 0 0 1 0 1.41l-.71.7a1 1 0 1 1-1.41-1.41l.7-.71a1 1 0 0 1 1.42 0Zm9.32 2.12a1 1 0 0 1-1.41 0l-.71-.7a1 1 0 1 1 1.41-1.42l.71.71a1 1 0 0 1 0 1.41ZM8.05 8.05a1 1 0 0 1-1.42 0l-.7-.71a1 1 0 1 1 1.41-1.41l.71.7a1 1 0 0 1 0 1.42Z" />
        </svg>
      </span>

      <span
        className={`absolute right-2 transition-all duration-300 ${darkMode ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}
        aria-hidden="true"
      >
        <svg className="w-3.5 h-3.5 text-blue-300" viewBox="0 0 24 24" fill="currentColor">
          <path d="M21.64 13.02a1 1 0 0 0-1.05-.14 7 7 0 0 1-9.45-9.45 1 1 0 0 0-1.19-1.4A10 10 0 1 0 22 14.2a1 1 0 0 0-.36-1.18Z" />
        </svg>
      </span>

      <span
        className={`relative inline-flex h-6 w-6 items-center justify-center rounded-full transition-all duration-300 ${
          darkMode
            ? 'translate-x-8 bg-slate-100 text-slate-900'
            : 'translate-x-0 bg-white text-slate-700'
        }`}
        aria-hidden="true"
      >
        <span className={`absolute h-1.5 w-1.5 rounded-full transition-all duration-300 ${darkMode ? 'bg-blue-500' : 'bg-amber-400'}`} />
      </span>
    </button>
  );
}
