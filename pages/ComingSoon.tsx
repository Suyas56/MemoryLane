import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Sparkles } from 'lucide-react';

export const ComingSoon = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center w-full min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 px-4">
      {/* Back Button */}
      <Link 
        to="/dashboard" 
        className="absolute top-6 left-6 p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full text-gray-900 dark:text-white transition"
      >
        <ArrowLeft size={24} />
      </Link>

      <div className="max-w-md text-center space-y-8">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="p-4 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full">
            <Sparkles size={48} className="text-white" />
          </div>
        </div>

        {/* Heading */}
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 dark:text-white">
            Coming Soon
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            We're working on something magical for you. This feature will be available shortly.
          </p>
        </div>

        {/* Description */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Your memory is safe and ready to be published once we complete our enhancements. Thank you for your patience!
          </p>
        </div>

        {/* CTA Button */}
        <Link
          to="/dashboard"
          className="inline-block bg-black dark:bg-white text-white dark:text-black px-8 py-3 rounded-xl font-semibold hover:bg-gray-800 dark:hover:bg-gray-200 transition"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
};
