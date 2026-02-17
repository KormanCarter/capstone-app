import React from 'react';

const SearchBar = ({ searchTerm, setSearchTerm }) => {
    return (
        <div className="flex max-w-3xl mx-auto shadow-xl rounded-xl overflow-hidden mb-8">
            <input
                type="text"
                placeholder="Search courses by name or keyword..."
                className="flex-1 px-6 py-5 text-lg outline-none bg-gray-50 text-slate-900"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button
                className="bg-emerald-600 text-white px-10 py-5 font-bold hover:bg-emerald-700 transition duration-300 disabled:opacity-50"
            >
                <span className="material-symbols-outlined">search</span>
            </button>
        </div>
    );
};

export default SearchBar;
