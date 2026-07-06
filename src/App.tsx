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
import { 
  initAuth, 
  logout, 
  getCourses, 
  getSchedule, 
  saveCourse, 
  removeCourse, 
  saveScheduleSlot, 
  removeScheduleSlot 
} from './lib/firebase';

export default function App() {
  const [user, setUser] = useState<UserSession | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [schedule, setSchedule] = useState<ScheduleSlot[]>([]);
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

    // 2. Authentication Recovery (Real-time Firebase Auth Sync)
    const unsubscribe = initAuth(
      async (firebaseUser, token) => {
        const session: UserSession = {
          email: firebaseUser.email || '',
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0],
          uid: firebaseUser.uid,
          photoURL: firebaseUser.photoURL || undefined,
          joinedAt: new Date().toISOString(),
        };
        setUser(session);
        localStorage.setItem('attend_iq_user', JSON.stringify(session));

        // Load account-specific courses from Firestore database
        const dbCourses = await getCourses(firebaseUser.uid);
        setCourses(dbCourses);

        // Load account-specific schedule from Firestore database
        const dbSchedule = await getSchedule(firebaseUser.uid);
        setSchedule(dbSchedule);

        setLoading(false);
      },
      () => {
        // Fallback or demo session restoration
        const storedUser = localStorage.getItem('attend_iq_user');
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser) as UserSession;
            setUser(parsedUser);
            
            const userKey = parsedUser.uid || 'demo-user-' + parsedUser.email.split('@')[0];
            
            const fetchLocalDemoData = async () => {
              const dbCourses = await getCourses(userKey);
              setCourses(dbCourses);
              const dbSchedule = await getSchedule(userKey);
              setSchedule(dbSchedule);
              setLoading(false);
            };
            fetchLocalDemoData();
          } catch (err) {
            console.error('Failed to parse cached session:', err);
            setLoading(false);
          }
        } else {
          setLoading(false);
        }
      }
    );

    return () => unsubscribe();
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

  const handleLogin = async (session: UserSession) => {
    setUser(session);
    localStorage.setItem('attend_iq_user', JSON.stringify(session));
    setLoading(true);

    const userId = session.uid || 'demo-user-' + session.email.split('@')[0];

    // Load custom courses and schedule from Firestore
    const dbCourses = await getCourses(userId);
    setCourses(dbCourses);

    const dbSchedule = await getSchedule(userId);
    setSchedule(dbSchedule);

    setLoading(false);
    setCurrentTab('dashboard');
  };

  const handleSignOut = async () => {
    await logout();
    setUser(null);
    setCourses([]);
    setSchedule([]);
    localStorage.removeItem('attend_iq_user');
  };

  const handleAddCourse = async (newC: Omit<Course, 'id' | 'createdAt'>) => {
    if (!user) return;
    const userId = user.uid || 'demo-user-' + user.email.split('@')[0];
    const course: Course = {
      ...newC,
      id: 'course-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    
    const nextCourses = [course, ...courses];
    setCourses(nextCourses);

    await saveCourse(userId, course);
  };

  const handleDeleteCourse = async (id: string) => {
    if (!user) return;
    const userId = user.uid || 'demo-user-' + user.email.split('@')[0];
    
    const nextCourses = courses.filter(c => c.id !== id);
    setCourses(nextCourses);

    await removeCourse(userId, id);

    // Clean up schedule slots tied to this deleted course
    const slotsToDelete = schedule.filter(s => s.courseId === id);
    for (const slot of slotsToDelete) {
      await removeScheduleSlot(userId, slot.id);
    }
    setSchedule(prev => prev.filter(s => s.courseId !== id));
  };

  const handleUpdateCourse = async (
    id: string,
    held: number,
    attended: number,
    name?: string,
    professor?: string,
    credits?: number,
    required_percent?: number
  ) => {
    if (!user) return;
    const userId = user.uid || 'demo-user-' + user.email.split('@')[0];
    
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

    const updatedCourse = nextCourses.find(c => c.id === id);
    if (updatedCourse) {
      await saveCourse(userId, updatedCourse);
    }
  };

  const handleUpdateSchedule = async (nextSchedule: ScheduleSlot[]) => {
    if (!user) return;
    const userId = user.uid || 'demo-user-' + user.email.split('@')[0];
    
    setSchedule(nextSchedule);

    // Sync database: Save current layout and prune removed ones
    const originalSlots = await getSchedule(userId);
    
    for (const slot of nextSchedule) {
      await saveScheduleSlot(userId, slot);
    }

    const nextIds = nextSchedule.map(s => s.id);
    const slotsToRemove = originalSlots.filter(s => !nextIds.includes(s.id));
    for (const slot of slotsToRemove) {
      await removeScheduleSlot(userId, slot.id);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F5F0] dark:bg-[#1C1C16] text-[#5A5A40] dark:text-[#D4A373]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-current border-t-transparent rounded-full animate-spin" />
          <p className="font-serif italic text-sm tracking-wide">Syncing Academic Database...</p>
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

