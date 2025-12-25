import React from 'react';
import { Link } from 'react-router-dom';

export const Logo = () => (
  <Link to="/" className="flex items-center gap-2 group">
    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-serif font-bold text-xl group-hover:rotate-6 transition-transform shadow-lg shadow-indigo-200 dark:shadow-none">M</div>
    <span className="font-serif font-bold text-xl tracking-tight text-gray-900 dark:text-white">MemoryLane</span>
  </Link>
);