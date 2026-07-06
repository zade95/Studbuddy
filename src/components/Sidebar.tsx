import React from 'react';
import { Book, Calendar, BarChart2, Sun, Moon, LogOut, Calculator, LayoutDashboard } from 'lucide-react';
import { UserSession } from '../types';

interface SidebarProps {
  currentTab: 'dashboard' | 'analytics' | 'courses' | 'schedule';
  onTabChange: (tab: 'dashboard' | 'analytics' | 'courses' | 'schedule') => void;
  user: UserSession | null;
  onSignOut: () => void;
  onOpenCalc: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

export default function Sidebar({
  currentTab,
  onTabChange,
  user,
  onSignOut,
  onOpenCalc,
  isDark,
  onToggleTheme,
}: SidebarProps) {
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={`hidden md:flex flex-col w-64 fixed left-0 top-0 h-screen border-r transition-colors z-40 p-md ${
        isDark 
          ? 'bg-[#1C1C16] border-[#2D2D25] text-[#D1D1C6]' 
          : 'bg-[#F5F5F0] border-[#EAEAE0] text-[#2D2D2D]'
      }`}>
        {/* Brand / Header */}
        <div className="flex items-center justify-between mb-lg px-2 pt-2">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-xl ${isDark ? 'bg-[#8C8C70]/20 text-[#D4A373]' : 'bg-[#5A5A40]/10 text-[#5A5A40]'}`}>
              <Book size={24} className="animate-pulse" />
            </div>
            <span className={`font-serif italic text-2xl tracking-tight ${isDark ? 'text-[#D4A373]' : 'text-[#5A5A40]'}`}>
              Studbuddy
            </span>
          </div>
          {/* Light/Dark Toggle */}
          <button
            onClick={onToggleTheme}
            id="theme-toggle-btn"
            className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
              isDark ? 'hover:bg-[#25251F] text-[#D4A373]' : 'hover:bg-white/80 text-[#5A5A40]'
            }`}
            title={isDark ? "Switch to Academic Clarity (Light)" : "Switch to Vibe Check (Dark)"}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>

        {/* User Profile Area */}
        {user && (
          <div className={`flex items-center gap-3 p-3 mb-xl rounded-2xl border transition-colors ${
            isDark 
              ? 'bg-[#25251F] border-[#2D2D25]' 
              : 'bg-white border-black/5 shadow-sm'
          }`}>
            <div className={`w-10 h-10 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center text-white font-serif italic text-lg ${
              isDark ? 'bg-[#8C8C70]' : 'bg-[#5A5A40]'
            }`}>
              {user.email.substring(0, 1).toUpperCase()}
            </div>
            <div className="overflow-hidden flex-1">
              <p className={`font-sans font-bold text-sm truncate ${isDark ? 'text-white' : 'text-[#2D2D2D]'}`}>
                {user.email.split('@')[0]}
              </p>
              <p className="font-sans text-[10px] uppercase tracking-wider opacity-60">
                Academic Term 2026
              </p>
            </div>
            <button 
              onClick={onSignOut}
              id="sign-out-btn"
              className="p-1 rounded hover:bg-rose-500/10 hover:text-rose-500 transition-colors cursor-pointer text-slate-400"
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="flex-1 flex flex-col gap-2 font-medium text-sm">
          <button
            onClick={() => onTabChange('dashboard')}
            id="nav-tab-dashboard"
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all cursor-pointer ${
              currentTab === 'dashboard'
                ? isDark
                  ? 'bg-[#8C8C70] text-[#1C1C16] font-bold shadow-sm'
                  : 'bg-[#5A5A40] text-white font-bold shadow-sm'
                : isDark
                  ? 'text-[#D1D1C6]/80 hover:bg-[#25251F]'
                  : 'text-[#2D2D2D]/80 hover:bg-white/80'
            }`}
          >
            <LayoutDashboard size={18} />
            <span className="font-serif italic text-base">Dashboard</span>
          </button>

          <button
            onClick={() => onTabChange('analytics')}
            id="nav-tab-analytics"
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all cursor-pointer ${
              currentTab === 'analytics'
                ? isDark
                  ? 'bg-[#8C8C70] text-[#1C1C16] font-bold shadow-sm'
                  : 'bg-[#5A5A40] text-white font-bold shadow-sm'
                : isDark
                  ? 'text-[#D1D1C6]/80 hover:bg-[#25251F]'
                  : 'text-[#2D2D2D]/80 hover:bg-white/80'
            }`}
          >
            <BarChart2 size={18} />
            <span className="font-serif italic text-base">Analytics</span>
          </button>

          <button
            onClick={() => onTabChange('courses')}
            id="nav-tab-courses"
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all cursor-pointer ${
              currentTab === 'courses'
                ? isDark
                  ? 'bg-[#8C8C70] text-[#1C1C16] font-bold shadow-sm'
                  : 'bg-[#5A5A40] text-white font-bold shadow-sm'
                : isDark
                  ? 'text-[#D1D1C6]/80 hover:bg-[#25251F]'
                  : 'text-[#2D2D2D]/80 hover:bg-white/80'
            }`}
          >
            <Book size={18} />
            <span className="font-serif italic text-base">Courses</span>
          </button>

          <button
            onClick={() => onTabChange('schedule')}
            id="nav-tab-schedule"
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all cursor-pointer ${
              currentTab === 'schedule'
                ? isDark
                  ? 'bg-[#8C8C70] text-[#1C1C16] font-bold shadow-sm'
                  : 'bg-[#5A5A40] text-white font-bold shadow-sm'
                : isDark
                  ? 'text-[#D1D1C6]/80 hover:bg-[#25251F]'
                  : 'text-[#2D2D2D]/80 hover:bg-white/80'
            }`}
          >
            <Calendar size={18} />
            <span className="font-serif italic text-base">Schedule</span>
          </button>
        </nav>

        {/* Bottom CTA */}
        <div className="mt-auto pt-md border-t border-black/5 dark:border-[#2D2D25]">
          <button
            onClick={onOpenCalc}
            id="calc-trigger-btn"
            className={`w-full py-3.5 px-4 text-white font-bold uppercase tracking-wider text-xs rounded-2xl transition-all hover:opacity-95 flex items-center justify-center gap-2 cursor-pointer ${
              isDark 
                ? 'bg-[#D4A373] text-black font-extrabold shadow-sm' 
                : 'bg-[#DDA15E] text-white shadow-sm'
            }`}
          >
            <Calculator size={16} />
            <span>Predictor tool</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header / Top Bar */}
      <header className={`md:hidden sticky top-0 flex items-center justify-between px-4 py-3 border-b z-40 transition-colors ${
        isDark ? 'bg-[#1C1C16] border-[#2D2D25] text-[#D1D1C6]' : 'bg-[#F5F5F0] border-[#EAEAE0] text-[#2D2D2D]'
      }`}>
        <div className="flex items-center gap-2">
          <Book size={20} className={isDark ? 'text-[#D4A373]' : 'text-[#5A5A40]'} />
          <span className={`font-serif italic text-xl tracking-tight ${isDark ? 'text-[#D4A373]' : 'text-[#5A5A40]'}`}>
            Studbuddy
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onToggleTheme}
            id="mobile-theme-toggle"
            className={`p-1.5 rounded-xl cursor-pointer ${
              isDark ? 'text-[#D4A373]' : 'text-[#5A5A40]'
            }`}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <button
            onClick={onOpenCalc}
            id="mobile-calc-trigger"
            className={`p-1.5 rounded-xl cursor-pointer ${
              isDark ? 'text-[#D4A373]' : 'text-[#5A5A40]'
            }`}
            title="Calculator Tool"
          >
            <Calculator size={18} />
          </button>

          {user && (
            <button
              onClick={onSignOut}
              id="mobile-sign-out"
              className="p-1.5 text-slate-400 hover:text-rose-500 cursor-pointer"
              title="Sign Out"
            >
              <LogOut size={18} />
            </button>
          )}
        </div>
      </header>

      {/* Mobile Bottom Tab Bar */}
      <nav className={`md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center py-2.5 px-2 border-t z-40 shadow-sm transition-colors ${
        isDark ? 'bg-[#1C1C16]/90 border-[#2D2D25] backdrop-blur-md' : 'bg-[#F5F5F0]/95 border-[#EAEAE0] backdrop-blur-md'
      }`}>
        <button
          onClick={() => onTabChange('dashboard')}
          id="mobile-tab-dashboard"
          className={`flex flex-col items-center justify-center py-1 px-4 rounded-xl transition-all cursor-pointer ${
            currentTab === 'dashboard'
              ? isDark
                ? 'bg-[#8C8C70]/20 text-[#D4A373] font-bold'
                : 'bg-[#5A5A40]/10 text-[#5A5A40] font-bold'
              : 'text-stone-500'
          }`}
        >
          <LayoutDashboard size={18} />
          <span className="text-[10px] font-serif mt-0.5">Dashboard</span>
        </button>

        <button
          onClick={() => onTabChange('analytics')}
          id="mobile-tab-analytics"
          className={`flex flex-col items-center justify-center py-1 px-4 rounded-xl transition-all cursor-pointer ${
            currentTab === 'analytics'
              ? isDark
                ? 'bg-[#8C8C70]/20 text-[#D4A373] font-bold'
                : 'bg-[#5A5A40]/10 text-[#5A5A40] font-bold'
              : 'text-stone-500'
          }`}
        >
          <BarChart2 size={18} />
          <span className="text-[10px] font-serif mt-0.5">Analytics</span>
        </button>

        <button
          onClick={() => onTabChange('courses')}
          id="mobile-tab-courses"
          className={`flex flex-col items-center justify-center py-1 px-4 rounded-xl transition-all cursor-pointer ${
            currentTab === 'courses'
              ? isDark
                ? 'bg-[#8C8C70]/20 text-[#D4A373] font-bold'
                : 'bg-[#5A5A40]/10 text-[#5A5A40] font-bold'
              : 'text-stone-500'
          }`}
        >
          <Book size={18} />
          <span className="text-[10px] font-serif mt-0.5">Courses</span>
        </button>

        <button
          onClick={() => onTabChange('schedule')}
          id="mobile-tab-schedule"
          className={`flex flex-col items-center justify-center py-1 px-4 rounded-xl transition-all cursor-pointer ${
            currentTab === 'schedule'
              ? isDark
                ? 'bg-[#8C8C70]/20 text-[#D4A373] font-bold'
                : 'bg-[#5A5A40]/10 text-[#5A5A40] font-bold'
              : 'text-stone-500'
          }`}
        >
          <Calendar size={18} />
          <span className="text-[10px] font-serif mt-0.5">Schedule</span>
        </button>
      </nav>
    </>
  );
}
