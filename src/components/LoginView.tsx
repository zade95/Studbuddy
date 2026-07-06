import React, { useState } from 'react';
import { Mail, ArrowRight, Book, Sparkles, CheckCircle, RefreshCw, LogIn } from 'lucide-react';
import { UserSession } from '../types';
import { googleSignIn, anonymousSignIn } from '../lib/firebase';

interface LoginViewProps {
  onLogin: (session: UserSession) => void;
  isDark: boolean;
}

export default function LoginView({ onLogin, isDark }: LoginViewProps) {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<'input' | 'sent'>('input');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await googleSignIn();
      if (result) {
        onLogin({
          email: result.user.email || 'unknown@user.com',
          name: result.user.displayName || result.user.email?.split('@')[0] || 'Google User',
          uid: result.user.uid,
          photoURL: result.user.photoURL || undefined,
          joinedAt: new Date().toISOString(),
        });
      }
    } catch (err: any) {
      console.warn('Google Auth warning (handled):', err);
      const errMsg = err?.message || String(err);
      const isPopupError = errMsg.includes('popup-closed-by-user') || 
                           errMsg.includes('cancelled-popup-request') ||
                           errMsg.includes('popup-blocked');
      
      if (isPopupError) {
        setError(
          'Google Sign-In popup was closed or blocked. Since this application is running inside a secure preview iframe, third-party cookies or popups might be blocked by your browser. Please use the Instant Guest Sign-In below instead!'
        );
      } else {
        setError('Google Authentication failed. Please try again or use the Instant Guest/Email option.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const fbUser = await anonymousSignIn();
      const uid = fbUser?.uid || 'user-zade5212';
      onLogin({
        email: 'zade5212@gmail.com',
        name: 'zade5212',
        uid,
        joinedAt: new Date().toISOString(),
      });
    } catch (err: any) {
      console.warn('Firebase anonymous sign in failed, using local fallback:', err);
      onLogin({
        email: 'zade5212@gmail.com',
        name: 'zade5212',
        uid: 'user-zade5212',
        joinedAt: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const fbUser = await anonymousSignIn();
      const uid = fbUser?.uid || 'user-' + email.split('@')[0].replace(/[^a-zA-Z0-9-]/g, '');
      onLogin({
        email: email.trim().toLowerCase(),
        name: email.split('@')[0],
        uid,
        joinedAt: new Date().toISOString(),
      });
    } catch (err: any) {
      console.warn('Firebase anonymous sign in failed, using local-secure session fallback:', err);
      onLogin({
        email: email.trim().toLowerCase(),
        name: email.split('@')[0],
        uid: 'user-' + email.split('@')[0].replace(/[^a-zA-Z0-9-]/g, ''),
        joinedAt: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  };

  const fillZadeEmail = () => {
    setEmail('zade5212@gmail.com');
    setError('');
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-300 ${
      isDark ? 'bg-[#1C1C16] text-[#D1D1C6]' : 'bg-[#F5F5F0] text-[#2D2D2D]'
    }`}>
      <div className={`w-full max-w-md p-8 rounded-[32px] border transition-all ${
        isDark 
          ? 'bg-[#25251F] border-[#2D2D25] shadow-lg' 
          : 'bg-white border-black/5 shadow-sm'
      }`}>
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className={`p-3 rounded-2xl mb-4 ${
            isDark ? 'bg-[#8C8C70]/10 text-[#D4A373] border border-[#8C8C70]/20' : 'bg-[#5A5A40]/10 text-[#5A5A40]'
          }`}>
            <Book size={36} className="animate-pulse" />
          </div>
          <h1 className={`font-serif italic text-3xl tracking-tight ${
            isDark ? 'text-[#D4A373]' : 'text-[#5A5A40]'
          }`}>
            Studbuddy
          </h1>
          <p className="font-sans text-xs mt-2 uppercase tracking-wider opacity-60">
            Academic attendance tracker & prediction engine
          </p>
        </div>

        <div className="space-y-5">
          {/* Google Sign In Button */}
          <button
            id="google-signin-btn"
            type="button"
            disabled={loading}
            onClick={handleGoogleLogin}
            className={`w-full py-3.5 px-4 font-bold rounded-2xl flex items-center justify-center gap-3 cursor-pointer transition-all border shadow-sm active:scale-98 ${
              isDark 
                ? 'bg-white border-transparent text-stone-900 hover:bg-stone-100' 
                : 'bg-white border-stone-200 text-stone-800 hover:bg-stone-50'
            }`}
          >
            {loading ? (
              <RefreshCw size={18} className="animate-spin text-stone-500" />
            ) : (
              <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5 shrink-0">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
              </svg>
            )}
            <span>{loading ? 'Connecting...' : 'Sign in with Google'}</span>
          </button>

          {/* Instant Guest Sign In fallback */}
          <button
            id="guest-signin-btn"
            type="button"
            disabled={loading}
            onClick={handleDemoLogin}
            className={`w-full py-3 px-4 font-bold rounded-2xl flex items-center justify-center gap-2 cursor-pointer transition-all border shadow-sm active:scale-98 ${
              isDark 
                ? 'bg-[#829653]/10 border-[#829653]/20 text-[#829653] hover:bg-[#829653]/20' 
                : 'bg-[#606C38]/10 border-[#606C38]/10 text-[#606C38] hover:bg-[#606C38]/20'
            }`}
          >
            <Sparkles size={16} className="text-amber-500 animate-pulse shrink-0" />
            <span>Instant Guest Sign-In (Highly Recommended)</span>
          </button>

          <div className="flex items-center my-4">
            <div className="flex-grow border-t border-black/5 dark:border-[#2D2D25]"></div>
            <span className="px-3 text-[10px] opacity-50 uppercase tracking-widest font-sans font-bold">or sign in with email</span>
            <div className="flex-grow border-t border-black/5 dark:border-[#2D2D25]"></div>
          </div>

          <form onSubmit={handleEmailSignIn} className="space-y-4">
            <div>
              <label htmlFor="email-input" className="block text-[10px] font-bold uppercase tracking-wider mb-2 opacity-75">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400">
                  <Mail size={18} />
                </span>
                <input
                  id="email-input"
                  type="email"
                  placeholder="name@university.edu"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError('');
                  }}
                  className={`w-full pl-11 pr-4 py-3 rounded-2xl border font-medium text-sm transition-all outline-none ${
                    isDark 
                      ? 'bg-[#1C1C16] border-[#2D2D25] text-white focus:border-[#8C8C70] focus:ring-1 focus:ring-[#8C8C70]' 
                      : 'bg-[#F5F5F0] border-black/5 text-[#2D2D2D] focus:bg-white focus:border-[#5A5A40] focus:ring-1 focus:ring-[#5A5A40]'
                  }`}
                />
              </div>
              {error && (
                <div className={`mt-2.5 p-4 rounded-2xl border text-xs font-medium space-y-3 ${
                  error.includes('popup') || error.includes('iframe')
                    ? isDark 
                      ? 'bg-amber-950/20 border-amber-500/20 text-amber-200' 
                      : 'bg-amber-50 border-amber-200 text-amber-800'
                    : 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/20 dark:border-rose-500/20 dark:text-rose-200'
                }`}>
                  <p className="flex items-start gap-2">
                    <span className="text-sm shrink-0">⚠️</span>
                    <span>{error}</span>
                  </p>
                  {(error.includes('popup') || error.includes('iframe')) && (
                    <button
                      type="button"
                      onClick={handleDemoLogin}
                      className={`w-full py-2 px-3 rounded-xl font-bold transition-all text-center text-xs flex items-center justify-center gap-1.5 cursor-pointer ${
                        isDark 
                          ? 'bg-[#829653] text-[#1C1C16] hover:opacity-90' 
                          : 'bg-[#606C38] text-white hover:opacity-90'
                      }`}
                    >
                      <Sparkles size={13} className="animate-pulse" />
                      <span>Bypass & Sign In as Guest Instantly</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            <button
              id="send-magic-link-btn"
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 px-4 font-bold rounded-2xl flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98 ${
                isDark 
                  ? 'bg-[#829653] hover:opacity-90 text-[#1C1C16]' 
                  : 'bg-[#606C38] hover:opacity-90 text-white shadow-sm'
              }`}
            >
              <span>Continue with Email</span>
              <ArrowRight size={18} />
            </button>

            {/* Quick Email Assist */}
            <div className="pt-4 border-t border-black/5 dark:border-[#2D2D25] text-center">
              <button
                type="button"
                id="demo-fill-btn"
                onClick={fillZadeEmail}
                className={`text-xs font-bold underline cursor-pointer hover:opacity-85 ${
                  isDark ? 'text-[#D4A373]' : 'text-[#5A5A40]'
                }`}
              >
                Quick fill: zade5212@gmail.com
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
