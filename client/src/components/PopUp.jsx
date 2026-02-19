
import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

const PopupComponent = ({ show, onClose, children }) => {
  const { darkMode } = useTheme();
  
  if (!show) {
    return null;
  }

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${darkMode ? 'bg-black bg-opacity-75' : 'bg-white bg-opacity-75'} backdrop-blur-sm`}>
      <div className={`relative rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto border ${darkMode ? 'bg-slate-900 border-slate-600' : 'bg-white border-slate-300'}`}>
        <button 
          onClick={onClose}
          className={`absolute top-4 right-4 transition duration-200 text-3xl font-bold z-10 ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
        >
          ×
        </button>
        <div className="p-8">
          {children}
        </div>
      </div>
    </div>
  );
};

export default PopupComponent;
