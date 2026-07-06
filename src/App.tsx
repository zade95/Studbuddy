/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Course, UserSession, ScheduleSlot } from './types';
import { DEFAULT_COURSES, DEFAULT_SCHEDULE } from './lib/attendance';
import Sidebar from './components/Sidebar';
import LoginView from './components/LoginView';
import DashboardView from './components/DashboardView';
import AnalyticsView from './components/AnalyticsView';
import CoursesView from './components/CoursesView';
import ScheduleView from './components/ScheduleView';
import PredictionCalculator from './components/PredictionCalculator';

export default function App() {
  const [user, setUser] = useState<UserSession | null>(null);
  const [courses, setCourses] = useState<Course[]>(DEFAULT_COURSES);
  const [schedule, setSchedule] = useState<ScheduleSlot[]>(DEFAULT_SCHEDULE);
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'analytics' | 'courses' | 'schedule'>('dashboard');
  const [isCalcOpen, setIsCalcOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [loading, setLoading] = useState(true);

  // Initialize theme and auth on mount
  useEffect(() => {
    // 1. Theme Configuration
    const storedTheme = localStorage.getItem('attend_iq_theme') === 'true';
    setIsDark(storedTheme);
    if (storedTheme) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // 2. Authentication Recovery
    const storedUser = localStorage.getItem('attend_iq_user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser) as UserSession;
        setUser(parsedUser);
        
        // Load account-specific courses
        const storedCourses = localStorage.getItem('attend_iq_courses_' + parsedUser.email);
        if (storedCourses) {
          setCourses(JSON.parse(storedCourses));
        } else {
          setCourses(DEFAULT_COURSES);
          localStorage.setItem('attend_iq_courses_' + parsedUser.email, JSON.stringify(DEFAULT_COURSES));
        }

        // Load account-specific schedule
        const storedSchedule = localStorage.getItem('attend_iq_schedule_' + parsedUser.email);
        if (storedSchedule) {
          setSchedule(JSON.parse(storedSchedule));
        } else {
          setSchedule(DEFAULT_SCHEDULE);
          localStorage.setItem('attend_iq_schedule_' + parsedUser.email, JSON.stringify(DEFAULT_SCHEDULE));
        }
      } catch (err) {
        console.error('Failed to parse cached session:', err);
      }
    }
    setLoading(false);
  }, []);

  const handleToggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    localStorage.setItem('attend_iq_theme', String(nextDark));
    if (nextDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleLogin = (session: UserSession) => {
    setUser(session);
    localStorage.setItem('attend_iq_user', JSON.stringify(session));

    // Load or initialize account-specific courses
    const stored = localStorage.getItem('attend_iq_courses_' + session.email);
    if (stored) {
      setCourses(JSON.parse(stored));
    } else {
      setCourses(DEFAULT_COURSES);
      localStorage.setItem('attend_iq_courses_' + session.email, JSON.stringify(DEFAULT_COURSES));
    }

    // Load or initialize account-specific schedule
    const storedSch = localStorage.getItem('attend_iq_schedule_' + session.email);
    if (storedSch) {
      setSchedule(JSON.parse(storedSch));
    } else {
      setSchedule(DEFAULT_SCHEDULE);
      localStorage.setItem('attend_iq_schedule_' + session.email, JSON.stringify(DEFAULT_SCHEDULE));
    }
    setCurrentTab('dashboard');
  };

  const handleSignOut = () => {
    setUser(null);
    localStorage.removeItem('attend_iq_user');
  };

  const handleAddCourse = (newC: Omit<Course, 'id' | 'createdAt'>) => {
    if (!user) return;
    const course: Course = {
      ...newC,
      id: 'course-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    const nextCourses = [course, ...courses]; // Show newest first
    setCourses(nextCourses);
    localStorage.setItem('attend_iq_courses_' + user.email, JSON.stringify(nextCourses));
  };

  const handleDeleteCourse = (id: string) => {
    if (!user) return;
    const nextCourses = courses.filter(c => c.id !== id);
    setCourses(nextCourses);
    localStorage.setItem('attend_iq_courses_' + user.email, JSON.stringify(nextCourses));
  };

  const handleUpdateCourse = (
    id: string,
    held: number,
    attended: number,
    name?: string,
    professor?: string,
    credits?: number,
    required_percent?: number
  ) => {
    if (!user) return;
    const nextCourses = courses.map(c => {
      if (c.id === id) {
        return {
          ...c,
          held,
          attended,
          name: name !== undefined ? name : c.name,
          professor: professor !== undefined ? professor : c.professor,
          credits: credits !== undefined ? credits : c.credits,
          required_percent: required_percent !== undefined ? required_percent : c.required_percent,
        };
      }
      return c;
    });
    setCourses(nextCourses);
    localStorage.setItem('attend_iq_courses_' + user.email, JSON.stringify(nextCourses));
  };

  const handleUpdateSchedule = (nextSchedule: ScheduleSlot[]) => {
    if (!user) return;
    setSchedule(nextSchedule);
    localStorage.setItem('attend_iq_schedule_' + user.email, JSON.stringify(nextSchedule));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F5F0] dark:bg-[#1C1C16] text-[#5A5A40] dark:text-[#D4A373]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-current border-t-transparent rounded-full animate-spin" />
          <p className="font-serif italic text-sm tracking-wide">Syncing Attendance Database...</p>
        </div>
      </div>
    );
  }

  // Guard: if not authenticated, redirect to custom login gateway
  if (!user) {
    return <LoginView onLogin={handleLogin} isDark={isDark} />;
  }

  return (
    <div className={`min-h-screen flex flex-col md:flex-row transition-colors duration-300 ${
      isDark ? 'bg-[#1C1C16] text-[#D1D1C6]' : 'bg-[#F5F5F0] text-[#2D2D2D]'
    }`}>
      {/* Shared Navigation Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        user={user}
        onSignOut={handleSignOut}
        onOpenCalc={() => setIsCalcOpen(true)}
        isDark={isDark}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main Content Area */}
      <main className="flex-grow p-4 md:p-10 md:ml-64 pb-24 md:pb-10 max-w-7xl w-full">
        {currentTab === 'dashboard' && (
          <DashboardView
            courses={courses}
            schedule={schedule}
            onUpdateCourse={handleUpdateCourse}
            onNavigateToTab={setCurrentTab}
            isDark={isDark}
          />
        )}

        {currentTab === 'analytics' && (
          <AnalyticsView courses={courses} isDark={isDark} />
        )}

        {currentTab === 'courses' && (
          <CoursesView
            courses={courses}
            onAddCourse={handleAddCourse}
            onDeleteCourse={handleDeleteCourse}
            onUpdateCourse={handleUpdateCourse}
            isDark={isDark}
          />
        )}

        {currentTab === 'schedule' && (
          <ScheduleView
            courses={courses}
            schedule={schedule}
            onUpdateSchedule={handleUpdateSchedule}
            onUpdateCourse={handleUpdateCourse}
            isDark={isDark}
          />
        )}
      </main>

      {/* Predictive Scenario Slider Overlay */}
      <PredictionCalculator
        courses={courses}
        isOpen={isCalcOpen}
        onClose={() => setIsCalcOpen(false)}
        isDark={isDark}
      />
    </div>
  );
}

