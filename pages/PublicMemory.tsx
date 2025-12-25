import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { storageService } from '../services/storage';
import { MemoryEvent, Theme } from '../types';
import { PhotoGrid } from '../components/PhotoGrid';
import { Toast } from '../components/ui/Toast';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import { ArrowLeft, Share2, Heart, AlertCircle, Loader2 } from 'lucide-react';
import { MainLayout } from '../components/layout/MainLayout';
import clsx from 'clsx';

// Animation Variants
const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1
    }
  }
};

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.8, 
      ease: [0.16, 1, 0.3, 1] as const
    } 
  }
};

interface ThemeStyle {
  bg: string;
  text: string;
  font: string;
  accentButton: string;
  secondaryButton: string;
  decoration: string;
}

const themeConfig: Record<Theme, ThemeStyle> = {
  modern: {
    bg: 'bg-white dark:bg-gray-900',
    text: 'text-gray-900 dark:text-white',
    font: 'font-serif',
    accentButton: 'bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200',
    secondaryButton: 'bg-white text-gray-800 border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:text-white dark:border-gray-700 dark:hover:bg-gray-700',
    decoration: 'opacity-10 bg-black dark:bg-white',
  },
  classic: {
    bg: 'bg-[#f0f4f8] dark:bg-[#1a202c]',
    text: 'text-[#2d3748] dark:text-gray-100',
    font: 'font-serif',
    accentButton: 'bg-[#2d3748] text-white hover:bg-[#4a5568] dark:bg-gray-200 dark:text-gray-900',
    secondaryButton: 'bg-white text-[#2d3748] border-[#cbd5e0] hover:bg-[#e2e8f0]',
    decoration: 'opacity-20 bg-[#2d3748] dark:bg-gray-400',
  },
  playful: {
    bg: 'bg-[#fff0f5] dark:bg-[#4a2c4a]',
    text: 'text-[#4a2c4a] dark:text-[#fff0f5]',
    font: 'font-[Comic_Sans_MS] font-sans',
    accentButton: 'bg-[#d53f8c] text-white hover:bg-[#b83280]',
    secondaryButton: 'bg-white text-[#d53f8c] border-[#fbb6ce] hover:bg-[#fff5f7]',
    decoration: 'opacity-20 bg-[#d53f8c]',
  },
  dark: {
    bg: 'bg-[#000000]',
    text: 'text-gray-100',
    font: 'font-sans',
    accentButton: 'bg-white text-black hover:bg-gray-200',
    secondaryButton: 'bg-gray-900 text-white border-gray-800 hover:bg-gray-800',
    decoration: 'opacity-20 bg-white',
  },
  minimalist: {
    bg: 'bg-zinc-50 dark:bg-zinc-950',
    text: 'text-zinc-800 dark:text-zinc-200',
    font: 'font-mono tracking-wide',
    accentButton: 'bg-zinc-800 text-white hover:bg-zinc-700 dark:bg-zinc-200 dark:text-zinc-900',
    secondaryButton: 'bg-transparent text-zinc-800 border-zinc-300 hover:bg-zinc-100 dark:text-zinc-200 dark:border-zinc-700',
    decoration: 'opacity-10 bg-zinc-800',
  },
  vintage: {
    bg: 'bg-[#f4f1ea] dark:bg-[#2c241b]',
    text: 'text-[#4a4036] dark:text-[#e6dccf]',
    font: 'font-serif italic',
    accentButton: 'bg-[#8b5e3c] text-[#f4f1ea] hover:bg-[#6d4c41]',
    secondaryButton: 'bg-[#f4f1ea] text-[#8b5e3c] border-[#d7ccc8] hover:bg-[#efebe9] dark:bg-[#3e342b] dark:text-[#d7ccc8] dark:border-[#5d4037]',
    decoration: 'opacity-15 bg-[#8b5e3c]',
  },
  whimsical: {
    bg: 'bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950 dark:via-purple-950 dark:to-pink-950',
    text: 'text-indigo-900 dark:text-indigo-100',
    font: 'font-sans',
    accentButton: 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:opacity-90 shadow-lg shadow-indigo-200 dark:shadow-none',
    secondaryButton: 'bg-white/50 text-indigo-900 border-indigo-200 hover:bg-white/80 dark:bg-black/20 dark:text-indigo-100 dark:border-indigo-800',
    decoration: 'opacity-20 bg-indigo-500',
  }
};

export const PublicMemory = () => {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<MemoryEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [toast, setToast] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (id) {
      storageService.getEventById(id).then(async (e) => {
        if (e) {
          setEvent(e);
          if(e.id !== 'demo') await storageService.incrementView(e.id);
        } else {
          setErrorMsg(`Could not find event with ID: ${id}`);
        }
        setLoading(false);
      });
    } else {
      setLoading(false);
      setErrorMsg("Invalid URL: No Event ID provided.");
    }
  }, [id]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setToast(true);
    setTimeout(() => setToast(false), 3000);
  };

  const handleLike = async () => {
    if (event && !liked) {
      if(event.id !== 'demo') await storageService.toggleLike(event.id);
      setEvent(prev => prev ? ({ ...prev, likes: prev.likes + 1 }) : null);
      setLiked(true);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-white dark:bg-gray-900"><Loader2 className="animate-spin text-gray-300 dark:text-gray-600" size={32}/></div>;

  // --- NOT FOUND STATE ---
  if (!event) return (
    <MainLayout>
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-lg mx-auto transition-colors">
        <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-6">
          <AlertCircle className="text-red-500 dark:text-red-400" size={32} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Memory Not Found</h2>
        <p className="text-red-600 dark:text-red-400 font-mono text-sm mb-6 bg-red-50 dark:bg-red-900/20 p-2 rounded">{errorMsg}</p>
        <Link to="/" className="mt-8 text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">Go Home</Link>
      </div>
    </MainLayout>
  );

  const theme = themeConfig[event.theme] || themeConfig.modern;

  return (
    <div className={clsx("min-h-screen flex flex-col transition-colors duration-500", theme.bg, theme.text, theme.font)}>
      {/* Custom Minimal Header */}
      <div className="fixed top-0 left-0 right-0 z-50 p-4 md:p-6 flex justify-between items-start pointer-events-none">
         <Link to="/" className="pointer-events-auto bg-white/10 backdrop-blur-md rounded-full p-2 hover:bg-white/20 transition text-current border border-white/10 shadow-lg"><ArrowLeft size={24}/></Link>
         <div className="pointer-events-auto bg-white/10 backdrop-blur-md rounded-full p-1 border border-white/10 shadow-lg">
           <ThemeToggle />
         </div>
      </div>

      <Toast message="Public link copied to clipboard!" visible={toast} />
      
      <motion.div variants={staggerContainer} initial="hidden" animate="show" className="flex-1 flex flex-col">
        {/* Hero Section */}
        <header className="relative pt-28 md:pt-36 pb-16 md:pb-20 px-6 text-center overflow-hidden">
          <motion.div variants={fadeInUp} className="relative z-10 max-w-4xl mx-auto">
            <div className={`inline-block mb-6 px-4 py-1.5 rounded-full border-2 border-current text-xs tracking-[0.2em] uppercase font-bold ${theme.decoration}`}>
              {event.occasion}
            </div>
            <h1 className="text-5xl md:text-8xl font-bold mb-8 tracking-tight leading-[1.1]">
              {event.title}
            </h1>
            <p className="opacity-50 font-medium text-sm md:text-base tracking-wide">Created on {new Date(event.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
          </motion.div>
        </header>

        {/* Message Section */}
        <motion.section variants={fadeInUp} className="max-w-3xl mx-auto px-8 md:px-12 mb-20 md:mb-28 text-center">
          <div className="text-6xl md:text-7xl opacity-10 leading-none mb-6 font-serif">"</div>
          <p className="text-xl md:text-3xl leading-relaxed md:leading-relaxed whitespace-pre-wrap opacity-90 font-light italic">
            {event.message}
          </p>
          <div className={`mt-10 h-0.5 w-32 mx-auto rounded-full ${theme.decoration}`}></div>
        </motion.section>

        {/* Photos Grid */}
        <motion.section variants={fadeInUp} className="max-w-[1600px] mx-auto px-6 md:px-10 pb-32">
          {event.photos && event.photos.length > 0 ? (
            <>
              <div className="text-xs uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-6 text-center font-semibold">
                {event.photos.length} {event.photos.length === 1 ? 'Photo' : 'Photos'}
              </div>
              <PhotoGrid photos={event.photos} />
            </>
          ) : (
            <div className="text-center py-20 text-gray-400">
              <p>No photos in this memory</p>
              <p className="text-xs mt-2">Photos array: {JSON.stringify(event.photos || [])}</p>
            </div>
          )}
        </motion.section>
      </motion.div>

      {/* Floating Action Bar */}
      <div className="fixed bottom-10 md:bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-3 z-40">
        <motion.button 
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.05 }}
          onClick={handleLike}
          className={clsx(
            "h-14 md:h-16 px-8 md:px-10 rounded-full shadow-2xl flex items-center gap-3 font-bold transition-all border-2 text-sm md:text-base backdrop-blur-sm",
            liked 
              ? "bg-pink-500 text-white border-pink-400 shadow-pink-500/50" 
              : theme.secondaryButton
          )}
        >
          <Heart fill={liked ? "currentColor" : "none"} size={22} />
          <span className="min-w-[2ch] text-center">{event.likes}</span>
        </motion.button>
        
        <motion.button 
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.05 }}
          onClick={handleShare}
          className={clsx("h-14 md:h-16 px-8 md:px-10 rounded-full shadow-2xl flex items-center gap-3 font-bold transition-all text-sm md:text-base", theme.accentButton)}
        >
          <Share2 size={20} />
          <span>Share</span>
        </motion.button>
      </div>

      <div className="pb-8 text-center opacity-25 text-xs md:text-sm tracking-wider font-medium">
        Powered by MemoryLane
      </div>
    </div>
  );
};