import React from 'react';
import { useData } from '../context/DataContext';

const FeedbackList: React.FC = () => {
    const { feedbacks, setCurrentView } = useData();

    return (
        <div className="flex-1 p-6 md:p-10 overflow-y-auto h-full bg-background-light dark:bg-background-dark font-display">
            <div className="max-w-[960px] mx-auto w-full">
                {/* Header */}
                <div className="flex flex-col gap-4 mb-8">
                    <nav className="flex items-center gap-2 text-sm text-slate-500">
                        <button onClick={() => setCurrentView('crm-directory')} className="hover:text-primary">CRM</button>
                        <span className="material-symbols-outlined text-base">chevron_right</span>
                        <span className="font-medium text-slate-900 dark:text-white">Feedback</span>
                    </nav>
                    <div className="flex justify-between items-end">
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white font-khmer">មតិយោបល់អតិថិជន (Customer Feedback)</h1>
                        <div className="flex gap-2">
                            <button className="flex items-center gap-2 rounded-lg h-10 px-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white text-sm font-bold shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700">
                                <span className="material-symbols-outlined">download</span> Download Report
                            </button>
                            <button className="flex items-center gap-2 rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold shadow-md hover:bg-blue-600">
                                <span className="material-symbols-outlined">add_comment</span> Request Review
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    <div className="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="flex justify-between"><p className="text-slate-500 dark:text-slate-400 text-sm font-medium font-khmer">ពិន្ទុសរុប</p><span className="material-symbols-outlined text-primary bg-primary/10 p-1 rounded-md">star</span></div>
                        <div className="flex items-baseline gap-2"><p className="text-3xl font-bold text-slate-900 dark:text-white">4.8</p><span className="text-slate-500 text-sm">/ 5.0</span></div>
                    </div>
                    {/* ... other stats ... */}
                </div>

                {/* Reviews List */}
                <div className="flex flex-col gap-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm divide-y divide-slate-200 dark:divide-slate-700">
                    {feedbacks.map(review => (
                        <div key={review.id} className="flex flex-col md:flex-row gap-6 p-6 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                            <div className="flex flex-col items-center md:items-start gap-3 min-w-[140px]">
                                <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-12 shadow-sm bg-slate-200" style={{ backgroundImage: `url('${review.avatar}')` }}></div>
                                <div className="text-center md:text-left">
                                    <p className="text-base font-bold text-slate-900 dark:text-white font-khmer">{review.customerName}</p>
                                    <p className="text-slate-500 text-xs mt-1 flex items-center gap-1 justify-center md:justify-start"><span className="material-symbols-outlined text-[14px]">calendar_today</span> {review.date}</p>
                                </div>
                            </div>
                            <div className="flex-1 flex flex-col gap-2">
                                <div className="flex justify-between items-start">
                                    <div className="flex text-yellow-400 gap-0.5">
                                        {[...Array(5)].map((_, i) => <span key={i} className={`material-symbols-outlined text-[20px] ${i < review.rating ? 'filled' : ''}`}>star</span>)}
                                    </div>
                                    <span className={`px-2 py-1 rounded text-xs font-medium border ${review.status === 'Responded' ? 'bg-green-50 text-green-700 border-green-100 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800' : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-700 dark:text-slate-300'}`}>{review.status === 'Responded' ? 'បានឆ្លើយតប' : 'រង់ចាំការឆ្លើយតប'}</span>
                                </div>
                                <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed font-khmer">{review.comment}</p>
                                <div className="flex gap-4 mt-2">
                                    <button className="text-primary hover:text-blue-700 text-sm font-semibold flex items-center gap-1.5 transition-colors font-khmer"><span className="material-symbols-outlined text-[18px]">reply</span> ឆ្លើយតប</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FeedbackList;