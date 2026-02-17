
import React from 'react';

const PopupComponent = ({ show, onClose, children }) => {
  if (!show) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-sm">
      <div className="relative bg-slate-900 border border-slate-600 rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition duration-200 text-3xl font-bold z-10"
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
