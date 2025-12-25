import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MemoryEvent, SearchResult } from '../types';
import { storageService } from '../services/storage';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Sparkles, LayoutTemplate, Share2, Heart, ArrowRight, Loader2 } from 'lucide-react';

export const Dashboard = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<MemoryEvent[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);

  const loadEvents = () => {
    if (user) {
      storageService.getEvents(user.id).then(data => {
        setEvents(data);
        setLoading(false);
      });
    }
  };

  useEffect(() => {
    loadEvents();
  }, [user]);

  useEffect(() => {
    if (searchQuery.trim()) {
      storageService.searchEvents(searchQuery).then(res => setResults(res));
    } else {
      setResults(events.map(e => ({ event: e, score: 0 })));
    }
  }, [searchQuery, events]);

  return (
    <div className="flex-1 max-w-6xl mx-auto p-4 md:p-6 w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4 mt-8">
        <h1 className="text-3xl font-serif font-bold text-gray-900 dark:text-white">Your Memories</h1>
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search memories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900 outline-none transition bg-white dark:bg-gray-800 shadow-sm text-gray-900 dark:text-white placeholder-gray-400"
            />
          </div>
          <Link to="/create" className="flex items-center justify-center gap-2 bg-black dark:bg-white text-white dark:text-black px-5 py-2.5 rounded-xl hover:bg-gray-800 dark:hover:bg-gray-200 transition shadow-md whitespace-nowrap">
            <Plus size={18} />
            <span className="font-medium">Create New</span>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-gray-400" size={32} /></div>
      ) : results.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-16 text-center border border-dashed border-gray-300 dark:border-gray-700 transition-colors">
          <div className="w-16 h-16 bg-gray-50 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
            <Sparkles size={24} />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No memories found</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Create a new memory to share with loved ones.</p>
          <Link to="/create" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">Start Creating</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {results.map(({ event, score }) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={event.id}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-xl dark:shadow-none dark:hover:bg-gray-750 transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700 group flex flex-col"
              >
                <div className="h-48 bg-gray-100 dark:bg-gray-700 relative overflow-hidden">
                   {event.photos.length > 0 ? (
                     <img src={event.photos[0].url} className="w-full h-full object-cover group-hover:scale-105 transition duration-700" alt="Cover" />
                   ) : (
                     <div className="w-full h-full flex items-center justify-center bg-gray-50 dark:bg-gray-700 text-gray-300 dark:text-gray-500">
                       <LayoutTemplate size={32} />
                     </div>
                   )}
                   {searchQuery && score > 0 && (
                     <div className="absolute top-3 right-3 bg-indigo-600/90 text-white text-[10px] font-bold px-2 py-1 rounded backdrop-blur-md shadow-sm">
                        Match
                     </div>
                   )}
                   <div className="absolute bottom-3 left-3 bg-white/90 dark:bg-black/80 backdrop-blur text-xs font-bold px-2 py-1 rounded text-gray-700 dark:text-gray-200 shadow-sm border border-black/5 dark:border-white/10">
                     {event.occasion}
                   </div>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-serif text-xl font-bold text-gray-900 dark:text-white mb-1 line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{event.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">For {event.recipientName}</p>
                  <div className="mt-auto">
                    <div className="flex justify-between items-center border-t border-gray-50 dark:border-gray-700 pt-4">
                      <div className="flex gap-4 text-xs font-medium text-gray-400 dark:text-gray-500">
                        <span className="flex items-center gap-1" title="Views"><Share2 size={14}/> {event.views}</span>
                        <span className="flex items-center gap-1" title="Likes"><Heart size={14}/> {event.likes}</span>
                      </div>
                      <Link to={`/view/${event.id}`} className="text-indigo-600 dark:text-indigo-400 text-sm font-semibold hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1">
                        View <ArrowRight size={14}/>
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};