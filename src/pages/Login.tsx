import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const success = await login(email, password);
    if (success) {
      navigate('/dashboard');
    } else {
      setError('Invalid email or password');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white flex flex-col lg:flex-row items-center justify-center p-6">
      
      {/* Left: Hero Section */}
      <motion.div
        initial={{ x: -60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.7 }}
        className="hidden lg:flex flex-col justify-center items-start w-full lg:w-1/2 px-10"
      >
        <img
          src="https://img.freepik.com/free-photo/crop-architect-opening-blueprint_23-2147710985.jpg?t=st=1742571469~exp=1742575069~hmac=6f513803d38cc947fbb1bbf2ebb6afe883a0ebd8f9b8ecf84b7c84a0f0d57ead&w=996" 
          alt="Construction Planning"
          className="w-full max-w-lg rounded-xl shadow-xl mb-8"
        />
        <h1 className="text-5xl font-extrabold text-netflix-red mb-4 leading-tight">
          Welcome to <span className="text-white">Construction Hub</span> 🏗️
        </h1>
        <p className="text-gray-300 text-lg max-w-md">
          Your centralized platform to digitize construction management — track resources, monitor progress, and make smarter decisions.
        </p>
      </motion.div>

      {/* Right: Login Card */}
      <motion.div
        initial={{ x: 60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.7 }}
        className="w-full max-w-md bg-[#1a1a1a] p-8 rounded-2xl shadow-2xl"
      >
        <h2 className="text-3xl lg:text-4xl font-bold mb-6 text-center text-white">
          Login<span className="text-netflix-red"></span>
        </h2>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-600/10 border border-red-500 rounded-md p-4 mb-6 flex items-center gap-2"
          >
            <AlertCircle className="text-red-500" size={20} />
            <p className="text-red-500">{error}</p>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-gray-300 mb-2">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-800 text-white px-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-netflix-red transition-all"
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-gray-300 mb-2">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-800 text-white px-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-netflix-red transition-all"
              placeholder="Enter your password"
              required
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            className="w-full bg-netflix-red text-white py-3 rounded-md font-semibold hover:bg-red-700 transition-all"
          >
            Sign In
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}

export default Login;
