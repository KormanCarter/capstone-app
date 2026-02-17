import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../utilities/Header.jsx';
import Footer from '../../utilities/Footer.jsx';
import { useAuth } from '../contexts/AuthContext';

const ProfilePage = () => {
    const { user, isAuthenticated, loading } = useAuth();
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [profileData, setProfileData] = useState({
        name: '',
        email: '',
        bio: '',
        phone: '',
        location: ''
    });

    useEffect(() => {
        // Redirect to login if not authenticated
        if (!loading && !isAuthenticated) {
            navigate('/login');
        }

        // Load user data when available
        if (user) {
            setProfileData({
                name: user.name || '',
                email: user.email || '',
                bio: user.bio || '',
                phone: user.phone || '',
                location: user.location || ''
            });
        }
    }, [user, isAuthenticated, loading, navigate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSave = async () => {
        try {
            const response = await fetch('/api/profile/update', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(profileData)
            });

            if (response.ok) {
                setIsEditing(false);
                // You could show a success message here
                alert('Profile updated successfully!');
            } else {
                alert('Failed to update profile');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Error updating profile');
        }
    };

    const handleCancel = () => {
        // Reset to user data
        if (user) {
            setProfileData({
                name: user.name || '',
                email: user.email || '',
                bio: user.bio || '',
                phone: user.phone || '',
                location: user.location || ''
            });
        }
        setIsEditing(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <p className="text-gray-400 text-xl">Loading...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black">
            <Header />
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Profile Header */}
                <div className="bg-gradient-to-r from-emerald-600 to-emerald-800 rounded-t-2xl p-8">
                    <div className="flex items-center gap-6">
                        <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-4xl font-bold text-white border-4 border-white/30">
                            {profileData.name ? profileData.name.charAt(0).toUpperCase() : '?'}
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold text-white mb-2">
                                {profileData.name || 'Your Profile'}
                            </h1>
                            <p className="text-emerald-100">
                                {profileData.email}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Profile Content */}
                <div className="bg-slate-900 border border-slate-600 rounded-b-2xl p-8">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-white">Profile Information</h2>
                        {!isEditing ? (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-emerald-500 transition duration-300"
                            >
                                Edit Profile
                            </button>
                        ) : (
                            <div className="flex gap-3">
                                <button
                                    onClick={handleSave}
                                    className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-emerald-500 transition duration-300"
                                >
                                    Save Changes
                                </button>
                                <button
                                    onClick={handleCancel}
                                    className="bg-gray-700 text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-600 transition duration-300"
                                >
                                    Cancel
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="space-y-6">
                        {/* Name Field */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-400 mb-2">
                                Full Name
                            </label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="name"
                                    value={profileData.name}
                                    onChange={handleInputChange}
                                    className="w-full bg-slate-800 border border-slate-600 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-emerald-500 transition"
                                    placeholder="Enter your name"
                                />
                            ) : (
                                <p className="text-white text-lg">
                                    {profileData.name || 'Not provided'}
                                </p>
                            )}
                        </div>

                        {/* Email Field (Read-only) */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-400 mb-2">
                                Email Address
                            </label>
                            <p className="text-white text-lg">
                                {profileData.email}
                            </p>
                            <p className="text-gray-500 text-sm mt-1">
                                Email cannot be changed
                            </p>
                        </div>

                        {/* Bio Field */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-400 mb-2">
                                Bio
                            </label>
                            {isEditing ? (
                                <textarea
                                    name="bio"
                                    value={profileData.bio}
                                    onChange={handleInputChange}
                                    rows="4"
                                    className="w-full bg-slate-800 border border-slate-600 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-emerald-500 transition"
                                    placeholder="Tell us about yourself..."
                                />
                            ) : (
                                <p className="text-white text-lg">
                                    {profileData.bio || 'No bio provided'}
                                </p>
                            )}
                        </div>

                        {/* Phone Field */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-400 mb-2">
                                Phone Number
                            </label>
                            {isEditing ? (
                                <input
                                    type="tel"
                                    name="phone"
                                    value={profileData.phone}
                                    onChange={handleInputChange}
                                    className="w-full bg-slate-800 border border-slate-600 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-emerald-500 transition"
                                    placeholder="Enter your phone number"
                                />
                            ) : (
                                <p className="text-white text-lg">
                                    {profileData.phone || 'Not provided'}
                                </p>
                            )}
                        </div>

                        {/* Location Field */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-400 mb-2">
                                Location
                            </label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="location"
                                    value={profileData.location}
                                    onChange={handleInputChange}
                                    className="w-full bg-slate-800 border border-slate-600 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-emerald-500 transition"
                                    placeholder="City, Country"
                                />
                            ) : (
                                <p className="text-white text-lg">
                                    {profileData.location || 'Not provided'}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Account Info */}
                    <div className="mt-8 pt-8 border-t border-slate-700">
                        <h3 className="text-xl font-bold text-white mb-4">Account Information</h3>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <p className="text-sm text-gray-400">Account ID</p>
                                <p className="text-white font-mono">{user?.id || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">Member Since</p>
                                <p className="text-white">
                                    {user?.created_at 
                                        ? new Date(user.created_at).toLocaleDateString('en-US', { 
                                            year: 'numeric', 
                                            month: 'long', 
                                            day: 'numeric' 
                                        })
                                        : 'N/A'
                                    }
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Enrolled Courses Section */}
                <div className="mt-8 bg-slate-900 border border-slate-600 rounded-2xl p-8">
                    <h2 className="text-2xl font-bold text-white mb-6">My Enrolled Courses</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        {/* Placeholder for enrolled courses - you can connect this to your backend later */}
                        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 hover:border-emerald-600 transition">
                            <p className="text-gray-400 text-center py-8">
                                No courses enrolled yet.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default ProfilePage;
