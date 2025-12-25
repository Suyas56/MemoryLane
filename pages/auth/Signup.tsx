import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { User as UserIcon, Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';

const AuthContainer = ({ children, title }: { children: React.ReactNode, title: string }) => (
  <div className="flex-1 flex flex-col items-center justify-center p-4">
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white dark:bg-gray-800 w-full max-w-md p-8 rounded-2xl shadow-xl border border-transparent dark:border-gray-700 relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />
      <h2 className="text-2xl font-serif font-bold text-center mb-6 text-gray-900 dark:text-white">{title}</h2>
      {children}
    </motion.div>
  </div>
);

export const Signup = () => {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(name, email, pass);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContainer title="Create Account">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg flex items-center gap-2"><AlertCircle size={16}/>{error}</div>}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
          <div className="relative">
             <UserIcon className="absolute left-3 top-3 text-gray-400" size={18} />
             <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full pl-10 pr-4 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 dark:text-white bg-white dark:bg-gray-700 transition-colors" required />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
          <div className="relative">
             <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
             <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full pl-10 pr-4 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 dark:text-white bg-white dark:bg-gray-700 transition-colors" required />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
          <div className="relative">
             <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
             <input type="password" value={pass} onChange={e => setPass(e.target.value)} className="w-full pl-10 pr-4 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 dark:text-white bg-white dark:bg-gray-700 transition-colors" required />
          </div>
        </div>
        <button disabled={loading} className="w-full bg-black dark:bg-white text-white dark:text-black py-3 rounded-lg font-semibold hover:bg-gray-800 dark:hover:bg-gray-200 transition disabled:opacity-50 flex justify-center shadow-lg dark:shadow-none">
          {loading ? <Loader2 className="animate-spin" /> : 'Sign Up'}
        </button>
        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          Already have an account? <Link to="/login" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">Log in</Link>
        </p>
      </form>
    </AuthContainer>
  );
};