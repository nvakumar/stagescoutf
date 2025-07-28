// src/pages/RegisterPage.tsx
import  { useState } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';

const RegisterPage = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Actor');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Clear previous messages
    setError('');
    setSuccess('');

    try {
      const response = await api.post('/api/auth/register', {
        fullName,
        email,
        password,
        role,
      });
      console.log('Registration successful:', response.data);
      setSuccess('Registration successful! You can now sign in.');
      // Clear form on success
      setFullName('');
      setEmail('');
      setPassword('');
    } catch (err: any) {
      console.error('Registration failed:', err);
      const message = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(message);
    }
  };

  const roles = [
    'Actor', 'Model', 'Filmmaker', 'Director', 'Writer',
    'Photographer', 'Editor', 'Musician', 'Creator', 'Student'
  ];

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Create Your Account</h1>
          <p className="mt-2 text-gray-400">Join the Stage Scout community</p>
        </div>

        {/* Notification Messages */}
        {error && (
            <div className="p-3 text-sm text-red-200 bg-red-900/50 border border-red-500/50 rounded-md" role="alert">
                {error}
            </div>
        )}
        {success && (
            <div className="p-3 text-sm text-green-200 bg-green-900/50 border border-green-500/50 rounded-md" role="alert">
                {success}
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Full Name Input */}
          <div>
            <label htmlFor="fullName" className="text-sm font-bold text-gray-400">
              Full Name
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full p-3 mt-2 text-white bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          {/* Email Input */}
          <div>
            <label htmlFor="email" className="text-sm font-bold text-gray-400">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 mt-2 text-white bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          {/* Password Input */}
          <div>
            <label htmlFor="password" className="text-sm font-bold text-gray-400">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 mt-2 text-white bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          {/* Role Select */}
          <div>
            <label htmlFor="role" className="text-sm font-bold text-gray-400">
              Your Primary Role
            </label>
            <select
              id="role"
              name="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full p-3 mt-2 text-white bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {roles.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          {/* Submit Button */}
          <div>
            <button
              type="submit"
              className="w-full p-3 font-bold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500"
            >
              Create Account
            </button>
          </div>
        </form>
        {/* Link to Login */}
        <div className="text-center text-sm text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-indigo-400 hover:text-indigo-500">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
