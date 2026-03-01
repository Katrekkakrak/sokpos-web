
import React, { useState } from 'react';
import { auth } from '../config/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  FacebookAuthProvider,
  RecaptchaVerifier,
  signInWithPhoneNumber
} from 'firebase/auth';
import { X, Facebook, Phone, Mail, Lock } from 'lucide-react';

interface CustomerAuthModalProps {
  onClose: () => void;
}

const CustomerAuthModal: React.FC<CustomerAuthModalProps> = ({ onClose }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Phone Auth State
  const [phoneAuthView, setPhoneAuthView] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<any>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookLogin = async () => {
    setError(null);
    setLoading(true);
    const provider = new FacebookAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (!phoneNumber) {
      setError("Please enter a phone number");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const appVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible'
      });
      const confirmation = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      setConfirmationResult(confirmation);
    } catch (err: any) {
      setError(err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || !confirmationResult) return;
    setError(null);
    setLoading(true);
    try {
      await confirmationResult.confirm(otp);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center fixed inset-0 z-50 p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-[4px] transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal Container */}
      <div className="duration-200 animate-in zoom-in-[0.95] fade-in overflow-hidden shadow-2xl rounded-[16px] dark:bg-slate-800 bg-white max-w-md w-full relative">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors z-10"
        >
          <X size={20} />
        </button>

        <div className="p-8">
          {phoneAuthView ? (
            // Phone Auth UI
            <div className="space-y-4">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-khmer mb-2">
                  ចូលគណនីដោយលេខទូរស័ព្ទ
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  {confirmationResult ? 'បញ្ចូលលេខកូដ OTP ដែលបានផ្ញើ' : 'បញ្ចូលលេខទូរស័ព្ទរបស់អ្នកដើម្បីទទួលកូដ OTP'}
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
                  <span className="material-icons-round text-lg">error_outline</span>
                  {error}
                </div>
              )}

              {!confirmationResult ? (
                <>
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Phone Number</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Phone size={18} />
                      </div>
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="block w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all sm:text-sm"
                        placeholder="+855 12 345 678"
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleSendOtp}
                    disabled={loading}
                    className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 rounded-xl shadow-lg transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Sending...' : 'ផ្ញើកូដ (Send OTP)'}
                  </button>
                </>
              ) : (
                <>
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Enter OTP</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Lock size={18} />
                      </div>
                      <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="block w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all sm:text-sm"
                        placeholder="123456"
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleVerifyOtp}
                    disabled={loading}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl shadow-lg transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Verifying...' : 'ផ្ទៀងផ្ទាត់ (Verify)'}
                  </button>
                </>
              )}

              <button 
                onClick={() => { setPhoneAuthView(false); setConfirmationResult(null); setError(null); }}
                className="w-full text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 text-sm font-medium mt-4"
              >
                ត្រឡប់ក្រោយ (Back)
              </button>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-khmer mb-2">
                  សូមស្វាគមន៍មកកាន់ហាងយើងខ្ញុំ 👋
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  {isSignUp ? 'បង្កើតគណនីថ្មីដើម្បីចាប់ផ្តើម' : 'ចូលគណនីដើម្បីបន្តការកុម្ម៉ង់'}
                </p>
              </div>

              {/* Social Logins */}
              <div className="space-y-3 mb-6">
                <button 
                  onClick={handleGoogleLogin}
                  className="w-full flex items-center justify-center gap-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-white font-medium py-2.5 rounded-xl transition-all shadow-sm"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  <span>បន្តជាមួយ Google</span>
                </button>

                <button 
                  onClick={handleFacebookLogin}
                  className="w-full flex items-center justify-center gap-3 bg-[#1877F2] hover:bg-[#1864F2] text-white font-medium py-2.5 rounded-xl transition-all shadow-sm"
                >
                  <Facebook size={20} fill="currentColor" />
                  <span>បន្តជាមួយ Facebook</span>
                </button>

                <button 
                  onClick={() => setPhoneAuthView(true)}
                  className="w-full flex items-center justify-center gap-3 bg-slate-800 hover:bg-slate-900 text-white font-medium py-2.5 rounded-xl transition-all shadow-sm"
                >
                  <Phone size={18} />
                  <span>បន្តជាមួយលេខទូរស័ព្ទ</span>
                </button>
              </div>

              {/* Divider */}
              <div className="relative flex items-center justify-center mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
                </div>
                <span className="relative bg-white dark:bg-slate-800 px-4 text-xs text-slate-400 uppercase font-medium font-khmer">
                  ឬ (OR)
                </span>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
                  <span className="material-icons-round text-lg">error_outline</span>
                  {error}
                </div>
              )}

              {/* Email Form */}
              <form onSubmit={handleAuth} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Email</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Mail size={18} />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all sm:text-sm"
                      placeholder="name@example.com"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock size={18} />
                    </div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all sm:text-sm"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-500/30 transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Processing...
                    </span>
                  ) : (
                    isSignUp ? 'ចុះឈ្មោះ (Sign Up)' : 'ចូលគណនី (Login)'
                  )}
                </button>
              </form>

              {/* Toggle Login/Signup */}
              <div className="mt-6 text-center">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {isSignUp ? 'មានគណនីរួចហើយ?' : 'មិនទាន់មានគណនី?'}
                  <button
                    type="button"
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="ml-1.5 text-blue-600 dark:text-blue-400 font-bold hover:underline focus:outline-none"
                  >
                    {isSignUp ? 'ចូលគណនី (Login)' : 'ចុះឈ្មោះ (Sign Up)'}
                  </button>
                </p>
              </div>
            </>
          )}
          <div id="recaptcha-container"></div>
        </div>
      </div>
    </div>
  );
};

export default CustomerAuthModal;
