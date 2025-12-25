import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';

export const Toast = ({ message, visible }: { message: string, visible: boolean }) => (
  <AnimatePresence>
    {visible && (
      <motion.div 
        initial={{ opacity: 0, y: 50, x: "-50%" }} 
        animate={{ opacity: 1, y: 0, x: "-50%" }} 
        exit={{ opacity: 0, y: 50, x: "-50%" }}
        className="fixed bottom-8 left-1/2 z-50 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 whitespace-nowrap"
      >
        <Check size={16} className="text-green-400 dark:text-green-600" />
        <span className="font-medium text-sm">{message}</span>
      </motion.div>
    )}
  </AnimatePresence>
);