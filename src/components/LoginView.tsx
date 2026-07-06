import React, { useState } from 'react';
import { Mail, ArrowRight, Book, Sparkles, CheckCircle } from 'lucide-react';
import { UserSession } from '../types';

interface LoginViewProps {
  onLogin: (session: UserSession) => void;
  isDark: boolean;
}

export default function LoginView({ onLogin, isDark }: LoginViewProps) {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<'input' | 'sent'>('input');
  const [error, setError] = useState('');

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
          <form onSubmit={handleSendLink} className="space-y-5">
            <div>
              <label htmlFor="email-input" className="block text-xs font-bold uppercase tracking-wider mb-2 opacity-75">
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
                  ? 'bg-[#8C8C70] hover:bg-[#8C8C70]/90 text-[#1C1C16] shadow-sm' 
                  : 'bg-[#5A5A40] hover:bg-[#5A5A40]/90 text-white shadow-sm'
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
