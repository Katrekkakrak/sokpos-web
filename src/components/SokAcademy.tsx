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
    <div className="bg-slate-50 dark:bg-slate-900 min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between md:items-center gap-6 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              🎓 Sok Academy
            </h1>
            <p className="mt-2 text-slate-500 dark:text-slate-400 font-khmer">
              មជ្ឈមណ្ឌលបណ្តុះបណ្តាលអាជីវកម្មអនឡាញ (Online Business Training Center)
            </p>
          </div>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
        </header>

        {/* Category Navigation */}
        <nav className="mb-8">
          <div className="flex flex-wrap gap-3">
            {categories.map(category => (
              <button
                key={category.key}
                onClick={() => setActiveCategory(category.key)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 font-khmer ${
                  activeCategory === category.key
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
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
            <p className='text-center p-10'>កំពុងទាញទិន្នន័យពី Firebase... (Loading...)</p>
          ) : courses.length === 0 ? (
            <p className='text-center p-10'>មិនមានមេរៀនទេ! (No courses found! Please try seeding the database.)</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredCourses.map((course, index) => (
                <div key={course.id || index} className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden border border-slate-200 dark:border-slate-700 group transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
                  {/* Thumbnail */}
                  <div className="relative aspect-video bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden">
                    <img 
                      src={`https://img.youtube.com/vi/${course.youtubeId}/hqdefault.jpg`} 
                      alt={course.title}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                    <Play size={48} className="relative z-10 text-white drop-shadow-md opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all" />
                    
                    {/* Badges */}
                    <div className="absolute top-3 right-3 z-10">
                      {course.isPremium ? (
                        <span className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold text-amber-800 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-300 rounded-full border border-amber-200 dark:border-amber-800">
                          <Lock size={10} /> PRO
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 text-[10px] font-bold text-green-800 bg-green-100 dark:bg-green-900/30 dark:text-green-300 rounded-full border border-green-200 dark:border-green-800">
                          FREE
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Card Content */}
                  <div className="p-5 flex flex-col">
                    <h3 className="font-khmer font-bold text-slate-900 dark:text-white text-base leading-snug mb-2 flex-grow">
                      {course.title}
                    </h3>
                    
                    {/* Meta Info */}
                    <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400 mb-4">
                      <span>ដោយ: {course.instructor}</span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} /> {course.duration}
                      </span>
                    </div>

                    {/* Progress Bar - Mocked for now */}
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-1">
                          <span className="text-[10px] font-medium text-slate-400">Progress</span>
                          <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">0%</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5">
                        <div 
                          className="bg-blue-600 h-1.5 rounded-full transition-all duration-500" 
                          style={{ width: `0%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <button 
                      onClick={() => setSelectedVideo(course.youtubeId)}
                      className="w-full bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 group-hover:bg-blue-600 dark:group-hover:bg-blue-600"
                    >
                      <span className="font-khmer">ចូលរៀន (Start Learning)</span>
                      <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Video Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 z-50 bg-black/80 flex flex-col items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-4xl flex justify-end mb-4">
             <button 
               onClick={() => setSelectedVideo(null)}
               className="text-white font-bold text-lg flex items-center gap-2 hover:text-red-500 transition-colors"
             >
               ✖ បិទ (Close)
             </button>
          </div>
          <iframe 
            src={`https://www.youtube.com/embed/${selectedVideo}?autoplay=1`} 
            className="w-full max-w-4xl aspect-video rounded-lg shadow-2xl border-4 border-slate-800" 
            allow="autoplay; fullscreen" 
            title="Course Video"
          />
        </div>
      )}
    </div>
  );
};

export default SokAcademy;