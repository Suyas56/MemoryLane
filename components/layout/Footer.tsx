import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Twitter, Instagram, Github, Globe } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 pt-16 pb-8 px-6 transition-colors duration-300 mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center text-white font-serif font-bold text-sm">M</div>
            <span className="font-serif font-bold text-lg text-gray-900 dark:text-white">MemoryLane</span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
            Crafting digital timeless moments. Secure, beautiful, and powered by intelligent design to keep your memories alive forever.
          </p>
          <div className="flex gap-4">
            <a href="#" className="text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition transform hover:scale-110"><Twitter size={18} /></a>
            <a href="#" className="text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition transform hover:scale-110"><Instagram size={18} /></a>
            <a href="#" className="text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition transform hover:scale-110"><Github size={18} /></a>
          </div>
        </div>
        
        <div>
          <h4 className="font-bold text-gray-900 dark:text-white mb-4">Product</h4>
          <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
            <li><Link to="/features" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">Features</Link></li>
            <li><Link to="/pricing" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">Pricing</Link></li>
            <li><Link to="/examples" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">Examples</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-gray-900 dark:text-white mb-4">Resources</h4>
          <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
            <li><Link to="/docs" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">Documentation</Link></li>
            <li><Link to="/help" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">Help Center</Link></li>
            <li><Link to="/privacy" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">Privacy Policy</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-gray-900 dark:text-white mb-4">Stay Updated</h4>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Get the latest templates and features.</p>
          <div className="flex gap-2">
            <input 
              type="email" 
              placeholder="Email address" 
              className="bg-gray-100 dark:bg-gray-800 border-0 rounded-lg px-3 py-2 text-sm w-full text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-colors" 
            />
            <button className="bg-black dark:bg-white text-white dark:text-black p-2 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition">
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto border-t border-gray-100 dark:border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-400">
        <p>&copy; 2024 MemoryLane Inc. All rights reserved.</p>
        <div className="flex gap-6">
           <span className="flex items-center gap-1 cursor-pointer hover:text-gray-600 dark:hover:text-gray-300 transition"><Globe size={12}/> English (US)</span>
        </div>
      </div>
    </footer>
  );
};