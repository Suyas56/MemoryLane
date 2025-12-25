import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Logo } from '../ui/Logo';
import { ThemeToggle } from '../ui/ThemeToggle';
import { LogOut, Menu, X, Plus, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Header = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isAuthPage = ['/login', '/signup'].includes(location.pathname);

  // Helper function to check if link is active
  const isActive = (path: string) => location.pathname === path;
  const isNavLink = (paths: string[]) => paths.some(p => location.pathname.startsWith(p));

  return (
    <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
        <Logo />
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8 flex-1 mx-8">
          {user && (
            <>
              <Link 
                to="/dashboard" 
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  isActive('/dashboard') 
                    ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' 
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <BookOpen size={18} />
                <span>Your Memories</span>
              </Link>
              
              <Link 
                to="/create" 
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  isActive('/create') 
                    ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' 
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Plus size={18} />
                <span>Create Memory</span>
              </Link>
            </>
          )}
        </div>
        
        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          <ThemeToggle />
          {user ? (
             <div className="flex items-center gap-4 pl-4 border-l border-gray-200 dark:border-gray-700">
               <div className="flex flex-col items-end mr-2">
                 <span className="text-sm font-bold text-gray-900 dark:text-white">{user.name}</span>
                 <span className="text-xs text-gray-500 dark:text-gray-400">Member</span>
               </div>
               <button 
                 onClick={logout} 
                 className="p-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition rounded-full hover:bg-red-50 dark:hover:bg-red-900/20" 
                 title="Log Out"
               >
                 <LogOut size={20} />
               </button>
             </div>
          ) : (
            !isAuthPage && (
              <>
                <Link to="/login" className="text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white font-medium transition">Log in</Link>
                <Link to="/signup" className="bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-full font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition text-sm shadow-md">Sign up</Link>
              </>
            )
          )}
        </div>

        {/* Mobile Toggle */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-gray-600 dark:text-gray-300"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden"
          >
            <div className="p-6 flex flex-col gap-4">
              {user ? (
                <>
                  <div className="flex items-center gap-3 pb-4 border-b border-gray-100 dark:border-gray-800">
                    <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 dark:text-white">{user.name}</div>
                      <div className="text-xs text-gray-500">{user.email}</div>
                    </div>
                  </div>
                  
                  <Link 
                    to="/dashboard" 
                    onClick={() => setIsMobileMenuOpen(false)} 
                    className={`flex items-center gap-3 py-3 px-4 rounded-lg font-medium transition-all ${
                      isActive('/dashboard')
                        ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                        : 'text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <BookOpen size={18} />
                    Your Memories
                  </Link>
                  
                  <Link 
                    to="/create" 
                    onClick={() => setIsMobileMenuOpen(false)} 
                    className={`flex items-center gap-3 py-3 px-4 rounded-lg font-medium transition-all ${
                      isActive('/create')
                        ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                        : 'text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <Plus size={18} />
                    Create Memory
                  </Link>
                  
                  <button 
                    onClick={() => { logout(); setIsMobileMenuOpen(false); }} 
                    className="text-left py-3 px-4 text-red-500 font-medium w-full hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                  >
                    Log Out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="block py-3 text-center w-full bg-gray-100 dark:bg-gray-800 rounded-xl text-gray-900 dark:text-white font-medium">Log in</Link>
                  <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)} className="block py-3 text-center w-full bg-indigo-600 text-white rounded-xl font-medium">Sign up</Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};