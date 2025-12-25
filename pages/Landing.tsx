import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export const Landing = () => {
  return (
    <div className="flex-1 max-w-7xl mx-auto px-6 pt-20 pb-32 text-center w-full">
      <motion.h1 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-5xl md:text-8xl font-serif font-medium text-gray-900 dark:text-white mb-8 tracking-tight leading-tight"
      >
        Your memories,<br/>beautifully told.
      </motion.h1>
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-lg md:text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-12"
      >
        Create stunning digital memory pages for birthdays, anniversaries, and special moments. 
        Powered by AI to help you find the right words.
      </motion.p>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex flex-col sm:flex-row justify-center gap-4"
      >
        <Link to="/signup" className="bg-indigo-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 dark:shadow-none hover:scale-105 transform duration-200">
          Start Creating for Free
        </Link>
      </motion.div>

      <div className="mt-24 relative rounded-2xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-800 max-w-5xl mx-auto group">
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none z-10" />
        <img src="https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070&auto=format&fit=crop" alt="App Preview" className="w-full opacity-90 group-hover:opacity-100 transition duration-700 transform group-hover:scale-105" />
      </div>
    </div>
  );
};