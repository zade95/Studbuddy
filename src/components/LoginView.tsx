import React, { useState } from 'react';
import { Mail, ArrowRight, Book, Sparkles, CheckCircle, RefreshCw } from 'lucide-react';
import { UserSession } from '../types';
import { googleSignIn } from '../lib/firebase';

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
      console.error('Google Auth Failed:', err);
      setError('Google Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    setError('');
    setStep('sent');
  };

  const handleInstantSignIn = () => {
    onLogin({
      email: email.trim().toLowerCase(),
      name: email.split('@')[0],
      uid: 'demo-user-' + email.split('@')[0],
      joinedAt: new Date().toISOString(),
    });
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

        {step === 'input' ? (
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

            <div className="flex items-center my-4">
              <div className="flex-grow border-t border-black/5 dark:border-[#2D2D25]"></div>
              <span className="px-3 text-[10px] opacity-50 uppercase tracking-widest font-sans font-bold">or demo email</span>
              <div className="flex-grow border-t border-black/5 dark:border-[#2D2D25]"></div>
            </div>

            <form onSubmit={handleSendLink} className="space-y-4">
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
                  <p className="text-rose-600 text-xs font-semibold mt-1.5 flex items-center gap-1">
                    <span>⚠️</span> {error}
                  </p>
                )}
              </div>

              <button
                id="send-magic-link-btn"
                type="submit"
                className={`w-full py-3 px-4 font-bold rounded-2xl flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98 ${
                  isDark 
                    ? 'bg-[#8C8C70]/20 hover:bg-[#8C8C70]/30 text-[#D4A373] border border-[#8C8C70]/20' 
                    : 'bg-[#5A5A40]/10 hover:bg-[#5A5A40]/20 text-[#5A5A40] border border-[#5A5A40]/10'
                }`}
              >
                <span>Send Magic Link</span>
                <ArrowRight size={18} />
              </button>

              {/* Quick Demo Assist */}
              <div className="pt-4 border-t border-black/5 dark:border-[#2D2D25] text-center">
                <p className="text-xs opacity-70 mb-2">Want to test with Zade's profile?</p>
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
        ) : (
          <div className="space-y-6 text-center">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-[#606C38]/10 text-[#606C38] border border-[#606C38]/20 rounded-full flex items-center justify-center animate-bounce">
                <CheckCircle size={32} />
              </div>
            </div>

            <div>
              <h2 className="font-serif italic text-xl text-[#606C38]">Check your inbox!</h2>
              <p className="text-sm mt-2 opacity-80 leading-relaxed">
                A secure login link has been sent to <br />
                <strong className={isDark ? 'text-white' : 'text-slate-900'}>{email}</strong>.
              </p>
            </div>

            {/* Simulated Link Delivery */}
            <div className={`p-4 rounded-2xl border text-left ${
              isDark 
                ? 'bg-[#1C1C16] border-[#2D2D25]' 
                : 'bg-stone-100/50 border-black/5'
            }`}>
              <div className={`flex items-center gap-2 mb-2 text-xs font-bold ${isDark ? 'text-[#D4A373]' : 'text-[#5A5A40]'}`}>
                <Sparkles size={14} />
                <span>Demo Magic Link Intercepted</span>
              </div>
              <p className="text-xs opacity-75 mb-3 leading-relaxed">
                For rapid local validation, click the button below to instantly complete the "Magic Link" authentication flow as if you clicked it in your email!
              </p>
              <button
                id="complete-sign-in-btn"
                onClick={handleInstantSignIn}
                className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold cursor-pointer text-center text-white transition-all hover:scale-98 ${
                  isDark 
                    ? 'bg-[#8C8C70] text-[#1C1C16] hover:opacity-90' 
                    : 'bg-[#5A5A40] text-white hover:opacity-90 shadow-sm'
                }`}
              >
                👉 Sign In Instantly as {email.split('@')[0]}
              </button>
            </div>

            <button
              onClick={() => setStep('input')}
              className="text-xs text-stone-500 hover:underline cursor-pointer"
            >
              ← Change email address
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
