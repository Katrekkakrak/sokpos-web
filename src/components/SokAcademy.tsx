import React, { useState, useEffect } from 'react';
import { Search, Play, Lock, Clock, ArrowRight } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

const SokAcademy: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  const categories = [
    { key: 'All', name: 'ទាំងអស់ (All)' },
    { key: 'Marketing', name: 'យុទ្ធសាស្ត្រទីផ្សារ (Marketing)' },
    { key: 'Sales', name: 'បិទការលក់ (Sales)' },
    { key: 'Management', name: 'គ្រប់គ្រងបុគ្គលិក (Management)' },
  ];

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const coursesCollection = collection(db, 'sok_courses');
        const coursesSnapshot = await getDocs(coursesCollection);
        const coursesList = coursesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCourses(coursesList);
      } catch (error) {
        console.error("Error fetching courses: ", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const filteredCourses = courses.filter(course => {
    const matchesCategory = activeCategory === 'All' || course.category === activeCategory;
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    // 💡 កែប្រែទី១៖ ដាក់ h-full និង overflow-y-auto ដើម្បីឲ្យ Scroll បានពេញលេញ
    <div className="h-full overflow-y-auto custom-scroll bg-slate-50 dark:bg-background-dark">
      {/* 💡 ដាក់ pb-24 សម្រាប់ទូរស័ព្ទ កុំឲ្យបាំងមេរៀនខាងក្រោមចុងគេ */}
      <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 pb-24">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-4xl font-bold text-slate-900 dark:text-white flex items-center gap-2 font-display">
              🎓 Sok Academy
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 font-khmer">
              មជ្ឈមណ្ឌលបណ្តុះបណ្តាលអាជីវកម្មអនឡាញ
            </p>
          </div>
          <div className="relative w-full md:w-80 shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="ស្វែងរកមេរៀន (Search)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary font-khmer text-sm shadow-sm transition-all"
            />
          </div>
        </header>

        {/* 💡 កែប្រែទី២៖ Category អាចអូសឆ្វេងស្តាំបាន (Swipeable) ដូច App ទំនើប */}
        <nav className="mb-6 -mx-4 px-4 md:mx-0 md:px-0">
          <div className="flex gap-2 overflow-x-auto custom-scroll pb-2 snap-x">
            {categories.map(category => (
              <button
                key={category.key}
                onClick={() => setActiveCategory(category.key)}
                className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 font-khmer snap-start ${
                  activeCategory === category.key
                    ? 'bg-primary text-white shadow-md shadow-primary/20'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </nav>

        {/* Course Grid */}
        <main>
          {loading ? (
            <div className="flex justify-center items-center py-20">
                <span className="material-icons-outlined animate-spin text-primary text-4xl">sync</span>
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                <span className="material-icons-outlined text-6xl text-slate-300 mb-4">school</span>
                <p className="font-khmer text-slate-500">មិនមានមេរៀនទេ! (No courses found)</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {filteredCourses.map((course, index) => (
                <div key={course.id || index} className="bg-white dark:bg-surface-dark rounded-2xl shadow-md overflow-hidden border border-slate-100 dark:border-slate-700 group transition-all duration-300 hover:shadow-xl flex flex-col">
                  {/* Thumbnail */}
                  <div className="relative aspect-video bg-slate-200 dark:bg-slate-800 flex items-center justify-center overflow-hidden shrink-0">
                    <img 
                      src={`https://img.youtube.com/vi/${course.youtubeId}/hqdefault.jpg`} 
                      alt={course.title}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                    <Play size={40} className="relative z-10 text-white drop-shadow-lg opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all" />
                    
                    {/* Badges */}
                    <div className="absolute top-3 right-3 z-10 flex gap-2">
                      {course.isPremium ? (
                        <span className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold text-amber-800 bg-amber-100 dark:bg-amber-500 dark:text-amber-950 rounded-full shadow-sm">
                          <Lock size={10} /> PRO
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 dark:bg-emerald-500 dark:text-emerald-950 rounded-full shadow-sm">
                          FREE
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Card Content */}
                  <div className="p-4 sm:p-5 flex flex-col flex-1">
                    <h3 className="font-khmer font-bold text-slate-900 dark:text-white text-sm sm:text-base line-clamp-2 leading-snug mb-3 flex-1">
                      {course.title}
                    </h3>
                    
                    {/* Meta Info */}
                    <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400 mb-4 font-khmer shrink-0">
                      <span className="truncate pr-2">ដោយ: {course.instructor}</span>
                      <span className="flex items-center gap-1 shrink-0 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                        <Clock size={12} /> {course.duration}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4 shrink-0">
                      <div className="flex justify-between items-center mb-1.5">
                          <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Progress</span>
                          <span className="text-[10px] font-bold text-primary">0%</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-primary h-full rounded-full transition-all duration-500 w-0"></div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <button 
                      onClick={() => setSelectedVideo(course.youtubeId)}
                      className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-primary text-slate-700 dark:text-slate-200 hover:text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 group/btn shrink-0"
                    >
                      <span className="font-khmer text-sm">ចូលរៀន (Start)</span>
                      <ArrowRight size={16} className="transition-transform group-hover/btn:translate-x-1" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* 💡 កែប្រែទី៣៖ Video Modal ឲ្យត្រូវខ្នាតលើទូរស័ព្ទ */}
      {selectedVideo && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center p-0 sm:p-4 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-4xl flex justify-between items-center p-4 sm:mb-2 bg-gradient-to-b from-black/80 to-transparent absolute top-0 z-10 sm:relative sm:bg-transparent">
             <h3 className="text-white font-khmer font-bold truncate pr-4 hidden sm:block">កំពុងចាក់វីដេអូ...</h3>
             <button 
               onClick={() => setSelectedVideo(null)}
               className="text-white bg-white/10 hover:bg-red-500 p-2 rounded-full transition-colors ml-auto flex items-center justify-center"
             >
               <span className="material-icons-outlined text-xl">close</span>
             </button>
          </div>
          <div className="w-full max-w-4xl aspect-video sm:rounded-xl overflow-hidden shadow-2xl border-0 sm:border border-slate-800 bg-black mt-12 sm:mt-0">
            <iframe 
              src={`https://www.youtube.com/embed/${selectedVideo}?autoplay=1&rel=0`} 
              className="w-full h-full" 
              allow="autoplay; fullscreen; picture-in-picture" 
              title="Course Video"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SokAcademy;