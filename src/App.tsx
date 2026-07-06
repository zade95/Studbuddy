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
  removeScheduleSlot,
  handleRedirectResult
} from './lib/firebase';

export default function App() {
  // Initialize state synchronously from localStorage to prevent delays or flashing loading screens
  const [user, setUser] = useState<UserSession | null>(() => {
    const stored = localStorage.getItem('attend_iq_user');
    if (stored) {
      try {
        return JSON.parse(stored) as UserSession;
      } catch (err) {
        console.error('Failed to parse stored user:', err);
      }
    }
    return null;
  });

  const [courses, setCourses] = useState<Course[]>(() => {
    const stored = localStorage.getItem('attend_iq_courses');
    if (stored) {
      try {
        return JSON.parse(stored) as Course[];
      } catch (err) {}
    }
    return [];
  });

  const [schedule, setSchedule] = useState<ScheduleSlot[]>(() => {
    const stored = localStorage.getItem('attend_iq_schedule');
    if (stored) {
      try {
        return JSON.parse(stored) as ScheduleSlot[];
      } catch (err) {}
    }
    return [];
  });

  const [currentTab, setCurrentTab] = useState<'dashboard' | 'analytics' | 'courses' | 'schedule'>('dashboard');
  const [isCalcOpen, setIsCalcOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [loading, setLoading] = useState(false); // Default to false to enable instant visual hydration

  // Save courses and schedule to localStorage when they change
  useEffect(() => {
    localStorage.setItem('attend_iq_courses', JSON.stringify(courses));
  }, [courses]);

  useEffect(() => {
    localStorage.setItem('attend_iq_schedule', JSON.stringify(schedule));
  }, [schedule]);

  // Initialize theme and background auth sync on mount
  useEffect(() => {
    // 1. Theme Configuration
    const storedTheme = localStorage.getItem('attend_iq_theme') === 'true';
    setIsDark(storedTheme);
    if (storedTheme) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Check Google Redirect Sign-In Result first for robust iframe fallback
    const checkRedirect = async () => {
      try {
        const redirectUser = await handleRedirectResult();
        if (redirectUser) {
          const session: UserSession = {
            email: redirectUser.email || '',
            name: redirectUser.displayName || redirectUser.email?.split('@')[0] || 'Google User',
            uid: redirectUser.uid,
            photoURL: redirectUser.photoURL || undefined,
            joinedAt: new Date().toISOString(),
          };
          setUser(session);
          localStorage.setItem('attend_iq_user', JSON.stringify(session));
          
          setLoading(true);
          try {
            const dbCourses = await getCourses(redirectUser.uid);
            if (dbCourses && dbCourses.length > 0) {
              setCourses(dbCourses);
            }
            const dbSchedule = await getSchedule(redirectUser.uid);
            if (dbSchedule && dbSchedule.length > 0) {
              setSchedule(dbSchedule);
            }
          } catch (e) {
            console.warn("Redirect database loading warning:", e);
          } finally {
            setLoading(false);
          }
        }
      } catch (err) {
        console.warn('Google Redirect sync error:', err);
      }
    };
    checkRedirect();

    // 2. Authentication Recovery & Background Sync (Real-time Firebase Auth Sync)
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

        try {
          // Load account-specific courses from Firestore database in the background
          const dbCourses = await getCourses(firebaseUser.uid);
          if (dbCourses && dbCourses.length > 0) {
            setCourses(dbCourses);
          }

          // Load account-specific schedule from Firestore database in the background
          const dbSchedule = await getSchedule(firebaseUser.uid);
          if (dbSchedule && dbSchedule.length > 0) {
            setSchedule(dbSchedule);
          }
        } catch (e) {
          console.warn("Background DB sync warning:", e);
        }
      },
      () => {
        // Fallback or demo session restoration
        const storedUser = localStorage.getItem('attend_iq_user');
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser) as UserSession;
            setUser(parsedUser);
            
            const userKey = parsedUser.uid || 'user-' + parsedUser.email.split('@')[0].replace(/[^a-zA-Z0-9-]/g, '');
            
            const fetchLocalDemoData = async () => {
              try {
                const dbCourses = await getCourses(userKey);
                if (dbCourses && dbCourses.length > 0) {
                  setCourses(dbCourses);
                }
                const dbSchedule = await getSchedule(userKey);
                if (dbSchedule && dbSchedule.length > 0) {
                  setSchedule(dbSchedule);
                }
              } catch (e) {
                console.warn("Background user DB sync warning:", e);
              }
            };
            fetchLocalDemoData();
          } catch (err) {
            console.error('Failed to parse cached session:', err);
          }
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

    const userId = session.uid || 'user-' + session.email.split('@')[0].replace(/[^a-zA-Z0-9-]/g, '');

    try {
      // Load custom courses from Firestore
      const dbCourses = await getCourses(userId);
      if (dbCourses && dbCourses.length > 0) {
        setCourses(dbCourses);
      } else {
        // Fallback to local storage if Firestore returned empty but we have local cache
        const stored = localStorage.getItem('attend_iq_courses');
        if (stored) {
          try {
            setCourses(JSON.parse(stored));
          } catch (e) {}
        }
      }
    } catch (err) {
      console.warn("Could not load courses from Firestore on login, falling back to local cache:", err);
      const stored = localStorage.getItem('attend_iq_courses');
      if (stored) {
        try {
          setCourses(JSON.parse(stored));
        } catch (e) {}
      }
    }

    try {
      // Load custom schedule from Firestore
      const dbSchedule = await getSchedule(userId);
      if (dbSchedule && dbSchedule.length > 0) {
        setSchedule(dbSchedule);
      } else {
        // Fallback to local storage if Firestore returned empty but we have local cache
        const stored = localStorage.getItem('attend_iq_schedule');
        if (stored) {
          try {
            setSchedule(JSON.parse(stored));
          } catch (e) {}
        }
      }
    } catch (err) {
      console.warn("Could not load schedule from Firestore on login, falling back to local cache:", err);
      const stored = localStorage.getItem('attend_iq_schedule');
      if (stored) {
        try {
          setSchedule(JSON.parse(stored));
        } catch (e) {}
      }
    }

    setLoading(false);
    setCurrentTab('dashboard');
  };

  const handleSignOut = async () => {
    await logout();
    setUser(null);
    setCourses([]);
    setSchedule([]);
    localStorage.removeItem('attend_iq_user');
    localStorage.removeItem('attend_iq_courses');
    localStorage.removeItem('attend_iq_schedule');
  };

  const handleImportDemoData = async () => {
    if (!user) return;
    const userId = user.uid || 'user-' + user.email.split('@')[0].replace(/[^a-zA-Z0-9-]/g, '');
    
    setCourses(DEFAULT_COURSES);
    setSchedule(DEFAULT_SCHEDULE);
    
    try {
      for (const course of DEFAULT_COURSES) {
        await saveCourse(userId, course);
      }
      for (const slot of DEFAULT_SCHEDULE) {
        await saveScheduleSlot(userId, slot);
      }
    } catch (e) {
      console.warn("Could not save demo data to Firestore:", e);
    }
  };

  const handleAddCourse = async (newC: Omit<Course, 'id' | 'createdAt'>) => {
    if (!user) return;
    const userId = user.uid || 'user-' + user.email.split('@')[0].replace(/[^a-zA-Z0-9-]/g, '');
    const course: Course = {
      ...newC,
      id: 'course-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    
    const nextCourses = [course, ...courses];
    setCourses(nextCourses);

    try {
      await saveCourse(userId, course);
    } catch (e) {
      console.warn("Could not save course to Firestore, local state preserved:", e);
    }
  };

  const handleDeleteCourse = async (id: string) => {
    if (!user) return;
    const userId = user.uid || 'user-' + user.email.split('@')[0].replace(/[^a-zA-Z0-9-]/g, '');
    
    const nextCourses = courses.filter(c => c.id !== id);
    setCourses(nextCourses);

    try {
      await removeCourse(userId, id);
    } catch (e) {
      console.warn("Could not remove course from Firestore, local state preserved:", e);
    }

    // Clean up schedule slots tied to this deleted course
    const slotsToDelete = schedule.filter(s => s.courseId === id);
    for (const slot of slotsToDelete) {
      try {
        await removeScheduleSlot(userId, slot.id);
      } catch (e) {
        console.warn("Could not remove schedule slot from Firestore, local state preserved:", e);
      }
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
    const userId = user.uid || 'user-' + user.email.split('@')[0].replace(/[^a-zA-Z0-9-]/g, '');
    
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
      try {
        await saveCourse(userId, updatedCourse);
      } catch (e) {
        console.warn("Could not update course in Firestore, local state preserved:", e);
      }
    }
  };

  const handleUpdateSchedule = async (nextSchedule: ScheduleSlot[]) => {
    if (!user) return;
    const userId = user.uid || 'user-' + user.email.split('@')[0].replace(/[^a-zA-Z0-9-]/g, '');
    
    setSchedule(nextSchedule);

    try {
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
    } catch (e) {
      console.warn("Could not sync schedule with Firestore, local state preserved:", e);
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
            onImportDemoData={handleImportDemoData}
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
            onImportDemoData={handleImportDemoData}
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

