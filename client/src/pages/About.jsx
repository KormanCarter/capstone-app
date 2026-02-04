import { useState } from 'react';
import Navbar from '../components/Navbar';

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <h1 className="text-4xl font-bold text-gray-800 mb-4">About Page</h1>
                <p className="text-gray-600">Learn more about Kormaia and our mission.</p>
            </div>
        </div>
    );
}

export { AboutPage };