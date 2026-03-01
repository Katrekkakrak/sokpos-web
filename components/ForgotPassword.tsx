import React, { useState } from 'react';

const ForgotPassword: React.FC = () => {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [newPassword, setNewPassword] = useState('');
    
    // Simulate navigation back to login (In real app, use router)
    const handleBackToLogin = () => {
        window.location.reload(); 
    };

    const handleSendOtp = () => {
        if (email) setStep(2);
    };

    const handleOtpChange = (index: number, value: string) => {
        if (value.length > 1) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        // Auto focus next
        if (value && index < 5) {
            const nextInput = document.getElementById(`otp-${index + 1}`);
            nextInput?.focus();
        }
    };

    const handleVerifyOtp = () => {
        if (otp.join('').length === 6) setStep(3);
    };

    const handleResetPassword = () => {
        if (newPassword) {
            alert('Password reset successfully!');
            handleBackToLogin();
        }
    };

    return (
        <div className="bg-background-light dark:bg-background-dark text-text-main font-body min-h-screen flex flex-col antialiased relative overflow-hidden">
            <div className="absolute inset-0 z-0 opacity-40 bg-geometric-pattern pointer-events-none" data-alt="Subtle dot pattern background"></div>
            
            <div className="relative z-10 flex flex-grow items-center justify-center p-4 sm:p-6 lg:p-8">
                <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-xl shadow-xl overflow-hidden border border-border-color/30 flex flex-col">
                    
                    {/* Header */}
                    <div className="p-6 pb-0 flex flex-col items-center">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                            <span className="material-symbols-outlined text-primary text-2xl">lock_reset</span>
                        </div>
                        <h1 className="text-2xl font-bold text-center text-text-main dark:text-white leading-tight">
                            កំណត់ពាក្យសម្ងាត់ឡើងវិញ
                        </h1>
                        <p className="text-text-secondary dark:text-slate-400 text-sm font-normal text-center mt-2 leading-relaxed">
                            {step === 1 && "ធ្វើតាមជំហានងាយៗដើម្បីទទួលបានគណនីរបស់អ្នកមកវិញ"}
                            {step === 2 && "យើងបានផ្ញើលេខកូដទៅកាន់អ៊ីមែលរបស់អ្នក"}
                            {step === 3 && "សូមបង្កើតពាក្យសម្ងាត់ថ្មីដែលមានសុវត្ថិភាព"}
                        </p>
                    </div>

                    {/* Content */}
                    <div className="p-6 sm:p-8 flex flex-col gap-6">
                        {/* Stepper */}
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <div className={`h-1.5 w-8 rounded-full transition-all duration-300 ${step >= 1 ? 'bg-primary' : 'bg-primary/20 dark:bg-slate-700'}`}></div>
                            <div className={`h-1.5 w-8 rounded-full transition-all duration-300 ${step >= 2 ? 'bg-primary' : 'bg-primary/20 dark:bg-slate-700'}`}></div>
                            <div className={`h-1.5 w-8 rounded-full transition-all duration-300 ${step >= 3 ? 'bg-primary' : 'bg-primary/20 dark:bg-slate-700'}`}></div>
                        </div>

                        {/* STEP 1 */}
                        {step === 1 && (
                            <div className="flex flex-col gap-5 animate-fade-in">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-text-main dark:text-slate-200 text-sm font-medium">អ៊ីមែល / លេខទូរស័ព្ទ</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-secondary">
                                            <span className="material-symbols-outlined text-[20px]">person</span>
                                        </div>
                                        <input 
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full rounded-lg border border-border-color dark:border-slate-600 bg-slate-50 dark:bg-slate-900 px-3 py-3 pl-10 text-base text-text-main dark:text-white placeholder:text-text-secondary/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary font-mono" 
                                            placeholder="example@email.com" 
                                            type="text" 
                                        />
                                    </div>
                                    <p className="text-xs text-text-secondary dark:text-slate-500 mt-1">យើងនឹងផ្ញើលេខកូដ OTP ទៅកាន់អ៊ីមែល ឬលេខទូរស័ព្ទរបស់អ្នក។</p>
                                </div>
                                <button onClick={handleSendOtp} className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white font-bold py-3 px-4 rounded-lg transition-colors">
                                    <span>ផ្ញើកូដ OTP</span>
                                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                                </button>
                            </div>
                        )}

                        {/* STEP 2 */}
                        {step === 2 && (
                            <div className="flex flex-col gap-5 animate-fade-in">
                                <div className="text-center">
                                    <p className="text-text-main dark:text-slate-200 text-sm font-medium mb-4">បញ្ជាក់លេខកូដ OTP</p>
                                    <div className="flex justify-between gap-2">
                                        {otp.map((digit, idx) => (
                                            <input 
                                                key={idx}
                                                id={`otp-${idx}`}
                                                value={digit}
                                                onChange={(e) => handleOtpChange(idx, e.target.value)}
                                                className="w-10 h-12 sm:w-12 sm:h-14 text-center border border-border-color dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-900 text-lg font-mono font-semibold text-text-main dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" 
                                                type="number" 
                                                maxLength={1}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-text-secondary dark:text-slate-500">មិនទទួលបានកូដ?</span>
                                    <button className="text-primary font-medium hover:underline">ផ្ញើកូដម្តងទៀត (58s)</button>
                                </div>
                                <button onClick={handleVerifyOtp} className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white font-bold py-3 px-4 rounded-lg transition-colors">
                                    <span>ផ្ទៀងផ្ទាត់ OTP</span>
                                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                                </button>
                            </div>
                        )}

                        {/* STEP 3 */}
                        {step === 3 && (
                            <div className="flex flex-col gap-4 animate-fade-in">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-text-main dark:text-slate-200 text-sm font-medium">ពាក្យសម្ងាត់ថ្មី</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-secondary">
                                            <span className="material-symbols-outlined text-[20px]">lock</span>
                                        </div>
                                        <input 
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="w-full rounded-lg border border-border-color dark:border-slate-600 bg-slate-50 dark:bg-slate-900 px-3 py-3 pl-10 pr-10 text-base text-text-main dark:text-white placeholder:text-text-secondary/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary font-mono" 
                                            placeholder="******" 
                                            type="password"
                                        />
                                        <button className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-secondary hover:text-text-main focus:outline-none">
                                            <span className="material-symbols-outlined text-[20px]">visibility_off</span>
                                        </button>
                                    </div>
                                </div>
                                <div className="pt-2">
                                    <button onClick={handleResetPassword} className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white font-bold py-3 px-4 rounded-lg shadow-md shadow-primary/20 transition-all transform active:scale-[0.98]">
                                        <span className="material-symbols-outlined text-[20px]">check_circle</span>
                                        <span>ផ្លាស់ប្តូរពាក្យសម្ងាត់</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-4 border-t border-border-color/30 flex justify-center">
                        <button onClick={handleBackToLogin} className="flex items-center gap-2 text-sm text-text-secondary hover:text-primary transition-colors font-medium group">
                            <span className="material-symbols-outlined text-[18px] transition-transform group-hover:-translate-x-1">arrow_back</span>
                            <span>ត្រឡប់ទៅចូលគណនីវិញ</span>
                        </button>
                    </div>
                </div>
                
                <div className="absolute bottom-6 flex gap-4 text-xs text-text-secondary">
                    <a className="hover:text-primary transition-colors" href="#">ជំនួយ</a>
                    <span>•</span>
                    <a className="hover:text-primary transition-colors" href="#">ភាសាខ្មែរ</a>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;