import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { storageService } from '../../services/storage';
import { generateMemoryMessage } from '../../services/geminiService';
import { MemoryEvent, Photo, Theme } from '../../types';
import { PhotoUploader } from '../../components/PhotoUploader';
import { PhotoGrid } from '../../components/PhotoGrid';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, Loader2, Sparkles, Plus } from 'lucide-react';

export const EditMemory = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingEvent, setLoadingEvent] = useState(true);
  const [formData, setFormData] = useState<Partial<MemoryEvent>>({
    occasion: 'Birthday',
    recipientName: '',
    message: '',
    photos: [],
    theme: 'modern',
    title: '',
  });

  const [aiPrompt, setAiPrompt] = useState('');
  const [aiTone, setAiTone] = useState('Heartfelt');

  // Load existing event
  useEffect(() => {
    if (id) {
      storageService.getEventById(id).then(event => {
        if (event) {
          setFormData(event);
        } else {
          alert('Memory not found');
          navigate('/dashboard');
        }
        setLoadingEvent(false);
      });
    }
  }, [id, navigate]);

  const handleGenerateMessage = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const msg = await generateMemoryMessage(formData.occasion || 'Day', formData.recipientName || 'Friend', user.name, aiTone, aiPrompt);
      setFormData(prev => ({ ...prev, message: msg }));
    } catch (e) {
      alert("Failed to generate");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!user || !id) return;
    setLoading(true);
    try {
      if (!formData.photos || formData.photos.length === 0) {
        alert("Please add at least one photo to your memory");
        setLoading(false);
        return;
      }

      const updatedEvent: any = {
        title: formData.title || `${formData.occasion} for ${formData.recipientName}`,
        occasion: formData.occasion!,
        recipientName: formData.recipientName!,
        message: formData.message!,
        photos: formData.photos!,
        theme: formData.theme as Theme,
      };
      
      await storageService.updateEvent(id, updatedEvent);
      navigate(`/view/${id}`);
    } catch(error: any) {
      console.error('Update error:', error);
      alert(error.message || "Error updating event. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoRemove = (photoId: string) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos?.filter(p => p.id !== photoId) || []
    }));
  };

  const handlePhotoReorder = (newOrder: Photo[]) => {
    setFormData(prev => ({
      ...prev,
      photos: newOrder
    }));
  };

  const themes: Theme[] = ['modern', 'classic', 'playful', 'dark', 'minimalist', 'vintage', 'whimsical'];

  if (loadingEvent) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col relative w-full">
       {/* Wizard Header */}
       <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 px-4 md:px-6 py-4 flex items-center justify-between sticky top-0 z-30">
         <div className="flex items-center gap-2 md:gap-4">
            <Link to="/dashboard" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-900 dark:text-white"><ArrowLeft size={20}/></Link>
            <span className="font-bold text-gray-900 dark:text-white text-sm md:text-base">Edit Memory</span>
         </div>
         <div className="flex items-center gap-4">
           <div className="flex gap-1 md:gap-2">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className={`h-2 w-6 md:w-12 rounded-full transition-all duration-300 ${i <= step ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'}`} />
              ))}
           </div>
         </div>
       </div>
       
       <div className="flex-1 flex items-center justify-center p-4 md:p-6 bg-gray-50 dark:bg-gray-900">
         <AnimatePresence mode="wait">
           <motion.div 
             key={step}
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             exit={{ opacity: 0, x: -20 }}
             transition={{ duration: 0.2 }}
             className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 md:p-8"
           >
             {step === 1 && (
               <div className="space-y-6">
                 <h2 className="text-2xl font-serif font-bold text-gray-900 dark:text-white">The Basics</h2>
                 <input className="w-full p-4 bg-gray-50 dark:bg-gray-700 border-0 rounded-xl focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-500 transition text-gray-900 dark:text-white placeholder-gray-400" placeholder="Event Title (e.g., Sarah's 30th)" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <select className="p-4 bg-gray-50 dark:bg-gray-700 border-0 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500" value={formData.occasion} onChange={e => setFormData({...formData, occasion: e.target.value})}>
                     <option>Birthday</option><option>Anniversary</option><option>Wedding</option><option>Travel</option><option>Just Because</option>
                   </select>
                   <input className="p-4 bg-gray-50 dark:bg-gray-700 border-0 rounded-xl text-gray-900 dark:text-white placeholder-gray-400" placeholder="Recipient Name" value={formData.recipientName} onChange={e => setFormData({...formData, recipientName: e.target.value})} />
                 </div>
                 <div className="flex justify-end"><button onClick={() => setStep(2)} className="bg-black dark:bg-white text-white dark:text-black px-6 py-3 rounded-xl font-medium flex items-center gap-2 hover:bg-gray-800 dark:hover:bg-gray-200 transition">Next <ArrowRight size={16}/></button></div>
               </div>
             )}
             {step === 2 && (
               <div className="space-y-6">
                 <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-2">
                    <h2 className="text-2xl font-serif font-bold text-gray-900 dark:text-white">The Message</h2>
                    <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded"><Sparkles size={12}/> AI Powered</div>
                 </div>
                 <div className="bg-indigo-50/50 dark:bg-indigo-900/20 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800 space-y-3">
                   <textarea className="w-full bg-white dark:bg-gray-700 p-3 rounded-lg text-sm border-0 focus:ring-1 focus:ring-indigo-200 text-gray-900 dark:text-white placeholder-gray-400 resize-none" rows={2} placeholder="Tell AI key details (e.g. 'loves hiking, funny, 30th birthday')" value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} />
                   <div className="flex justify-between items-center">
                     <select className="bg-white dark:bg-gray-700 text-sm p-2 rounded border-0 text-gray-900 dark:text-white focus:ring-1 focus:ring-indigo-500" value={aiTone} onChange={e => setAiTone(e.target.value)}><option>Heartfelt</option><option>Funny</option><option>Poetic</option></select>
                     <button onClick={handleGenerateMessage} disabled={loading} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-indigo-700 transition disabled:opacity-50 flex items-center gap-1">
                       {loading ? <Loader2 className="animate-spin" size={12}/> : <Sparkles size={12}/>}
                       {loading ? 'Writing...' : 'Generate'}
                     </button>
                   </div>
                 </div>
                 <textarea className="w-full p-4 bg-gray-50 dark:bg-gray-700 border-0 rounded-xl font-serif text-lg h-40 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500" placeholder="Your heartfelt message goes here..." value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} />
                 <div className="flex justify-between"><button onClick={() => setStep(1)} className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">Back</button><button onClick={() => setStep(3)} className="bg-black dark:bg-white text-white dark:text-black px-6 py-3 rounded-xl font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition">Next</button></div>
               </div>
             )}
             {step === 3 && (
               <div className="space-y-6">
                 <h2 className="text-2xl font-serif font-bold text-gray-900 dark:text-white">Memories</h2>
                 <PhotoUploader onPhotosAdded={ps => setFormData(prev => ({ ...prev, photos: [...(prev.photos || []), ...ps] }))} />
                 <div className="bg-gray-100 dark:bg-gray-700 rounded-xl p-4 min-h-[200px] border-2 border-dashed border-gray-200 dark:border-gray-600">
                   {formData.photos && formData.photos.length > 0 ? (
                      <>
                        <p className="text-xs text-center text-gray-400 mb-4 uppercase tracking-wider font-semibold">Drag to reorder • Click X to remove</p>
                        <PhotoGrid 
                          photos={formData.photos} 
                          onRemove={handlePhotoRemove}
                          onReorder={handlePhotoReorder}
                        />
                      </>
                   ) : (
                     <div className="h-full flex flex-col items-center justify-center text-gray-400 mt-10">
                        <div className="p-4 bg-white dark:bg-gray-800 rounded-full mb-2"><Plus size={24}/></div>
                        <p>Photos you upload will appear here</p>
                     </div>
                   )}
                 </div>
                 <div className="flex justify-between"><button onClick={() => setStep(2)} className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">Back</button><button onClick={() => setStep(4)} className="bg-black dark:bg-white text-white dark:text-black px-6 py-3 rounded-xl font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition">Next</button></div>
               </div>
             )}
             {step === 4 && (
               <div className="space-y-6">
                 <h2 className="text-2xl font-serif font-bold text-gray-900 dark:text-white">Theme & Review</h2>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                   {themes.map(t => (
                     <button 
                      key={t} 
                      onClick={() => setFormData({...formData, theme: t})} 
                      className={`px-3 py-3 rounded-lg capitalize border transition-all text-sm font-medium
                        ${formData.theme === t 
                          ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-gray-900' 
                          : 'bg-white border-gray-200 text-gray-600 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'}`}
                      >
                        {t}
                      </button>
                   ))}
                 </div>
                 <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-6 bg-gray-50/50 dark:bg-gray-700/50 flex flex-col items-center text-center">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">{formData.occasion}</p>
                    <p className="font-serif text-2xl md:text-3xl text-gray-900 dark:text-white mb-2">{formData.title}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">For {formData.recipientName} • {formData.photos?.length} Photos</p>
                 </div>
                 <div className="flex justify-between"><button onClick={() => setStep(3)} className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">Back</button><button onClick={handleUpdate} disabled={loading} className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-200 dark:shadow-none hover:bg-blue-700 transition flex items-center gap-2">
                   {loading ? <Loader2 className="animate-spin" size={16}/> : <Check size={16}/>}
                   Update Memory
                 </button></div>
               </div>
             )}
           </motion.div>
         </AnimatePresence>
       </div>
    </div>
  );
};
