import React, { useState, useEffect } from 'react';
import { LayoutDashboard, BookOpen, AlertTriangle, CheckCircle, Clock, MapPin, Calculator, TrendingUp, Sparkles, Plus, Trash2, Pin, Square, CheckSquare } from 'lucide-react';
import { Course, ScheduleSlot } from '../types';
import { calculateAttendance } from '../lib/attendance';

interface DashboardViewProps {
  courses: Course[];
  schedule: ScheduleSlot[];
  onUpdateCourse: (
    id: string,
    held: number,
    attended: number,
    name?: string,
    professor?: string,
    credits?: number,
    required_percent?: number
  ) => void;
  onNavigateToTab: (tab: 'dashboard' | 'analytics' | 'courses' | 'schedule') => void;
  isDark: boolean;
  onImportDemoData?: () => void;
}

export default function DashboardView({
  courses,
  schedule,
  onUpdateCourse,
  onNavigateToTab,
  isDark,
  onImportDemoData,
}: DashboardViewProps) {
  // State for editing target attendances
  const [editingTargetId, setEditingTargetId] = useState<string | null>(null);
  const [tempTargetVal, setTempTargetVal] = useState<number>(75);
  
  const [isEditingGlobalTarget, setIsEditingGlobalTarget] = useState<boolean>(false);
  const [globalTargetVal, setGlobalTargetVal] = useState<number>(75);

  const [notes, setNotes] = useState<{ id: string; text: string; completed: boolean }[]>(() => {
    try {
      const saved = localStorage.getItem('studbuddy_dashboard_notes');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Error loading notes:', e);
    }
    return [
      { id: '1', text: "Revise Calculus integration formulas before Thursday's lecture", completed: false },
      { id: '2', text: "Meet with Physics study group at the library (3 PM)", completed: false },
      { id: '3', text: "Maintain solid attendance streak in Data Structures to hit target", completed: true },
    ];
  });
  const [newNoteText, setNewNoteText] = useState('');

  // Save notes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('studbuddy_dashboard_notes', JSON.stringify(notes));
    } catch (e) {
      console.warn('Error saving notes:', e);
    }
  }, [notes]);

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    const newNote = {
      id: String(Date.now()),
      text: newNoteText.trim(),
      completed: false,
    };
    setNotes(prev => [...prev, newNote]);
    setNewNoteText('');
  };

  const handleToggleNote = (id: string) => {
    setNotes(prev => prev.map(note => note.id === id ? { ...note, completed: !note.completed } : note));
  };

  const handleDeleteNote = (id: string) => {
    setNotes(prev => prev.filter(note => note.id !== id));
  };

  const handleSaveTarget = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    if (!course) return;
    
    // clamp between 0 and 100
    const clampedVal = Math.max(0, Math.min(100, tempTargetVal));
    onUpdateCourse(course.id, course.held, course.attended, undefined, undefined, undefined, clampedVal);
    setEditingTargetId(null);
  };

  // If there are no courses registered, show a premium empty slate screen
  if (courses.length === 0) {
    return (
      <div className="space-y-8 animate-fade-in">
        {/* Dynamic Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 animate-fade-in">
          <div>
            <h2 className={`font-serif italic tracking-tight text-3xl md:text-4xl ${isDark ? 'text-[#D4A373]' : 'text-[#5A5A40]'}`}>
              Dashboard Hub
            </h2>
            <p className="font-sans text-xs mt-1.5 uppercase tracking-wider opacity-60">
              Welcome to Studbuddy! Fall Academic Term · Tue, Oct 15, 2026
            </p>
          </div>
        </div>

        {/* Empty Slate Card */}
        <div className={`rounded-[32px] p-8 md:p-12 border text-center flex flex-col items-center justify-center space-y-6 ${
          isDark ? 'bg-[#25251F] border-[#2D2D25]' : 'bg-white border-black/5'
        }`}>
          <div className={`p-4 rounded-2xl ${
            isDark ? 'bg-[#829653]/10 text-[#829653]' : 'bg-[#606C38]/10 text-[#606C38]'
          }`}>
            <BookOpen size={48} className="animate-pulse" />
          </div>

          <div className="max-w-md space-y-2">
            <h3 className={`font-serif italic text-2xl font-bold ${isDark ? 'text-white' : 'text-[#2D2D2D]'}`}>
              Your academic slate is clean
            </h3>
            <p className="text-sm opacity-70">
              Get started by adding your registered courses for this semester, or import our curated university test-data preset to instantly explore the app's analytical tools.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 w-full sm:w-auto">
            <button
              onClick={() => onNavigateToTab('courses')}
              className={`w-full sm:w-auto py-3 px-6 font-bold rounded-2xl flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98 ${
                isDark 
                  ? 'bg-[#829653] text-[#1C1C16] hover:opacity-90' 
                  : 'bg-[#606C38] text-white hover:opacity-90'
              }`}
            >
              <LayoutDashboard size={16} />
              <span>Add Your First Course</span>
            </button>

            {onImportDemoData && (
              <button
                onClick={onImportDemoData}
                className={`w-full sm:w-auto py-3 px-6 font-bold rounded-2xl flex items-center justify-center gap-2 cursor-pointer transition-all border ${
                  isDark 
                    ? 'border-[#2D2D25] bg-[#1C1C16] text-[#D4A373] hover:bg-[#25251F]' 
                    : 'border-black/5 bg-[#F5F5F0] text-[#5A5A40] hover:bg-[#EAEAE2]'
                }`}
              >
                <Sparkles size={16} className="text-amber-500 animate-pulse" />
                <span>Seed Sandbox Preset Data</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const handleSaveGlobalTarget = () => {
    const clampedVal = Math.max(0, Math.min(100, globalTargetVal));
    // Update target for ALL courses
    courses.forEach(c => {
      onUpdateCourse(c.id, c.held, c.attended, undefined, undefined, undefined, clampedVal);
    });
    setIsEditingGlobalTarget(false);
  };
  // 1. Calculations
  const totalHeld = courses.reduce((acc, c) => acc + c.held, 0);
  const totalAttended = courses.reduce((acc, c) => acc + c.attended, 0);
  const overallPercent = totalHeld > 0 ? (totalAttended / totalHeld) * 100 : 100;

  const avgRequired = courses.length > 0
    ? courses.reduce((acc, c) => acc + c.required_percent, 0) / courses.length
    : 75;

  const isOverallSafe = overallPercent >= avgRequired;

  // Active danger items
  const dangerCourses = courses.filter(c => {
    const calc = calculateAttendance(c.held, c.attended, c.required_percent);
    return !calc.isSafe;
  });

  // Next upcoming class (based on mock current time Tuesday 1:30 PM)
  // Let's look for slots on Tuesday after 13:30 (1:30 PM) or default to slot-3 (PHYS101 Mechanics, 2:00 PM)
  const upcomingSlot = schedule.find(s => s.id === 'slot-3') || schedule[0];

  const handleQuickIncrement = (courseId: string, type: 'attended' | 'skipped') => {
    const course = courses.find(c => c.id === courseId);
    if (!course) return;

    const nextHeld = course.held + 1;
    let nextAttended = course.attended;
    if (type === 'attended') {
      nextAttended += 1;
    }

    onUpdateCourse(courseId, nextHeld, nextAttended);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Dynamic Header / Welcome */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className={`font-serif italic tracking-tight text-3xl md:text-4xl ${isDark ? 'text-[#D4A373]' : 'text-[#5A5A40]'}`}>
            Dashboard Hub
          </h2>
          <p className="font-sans text-xs mt-1.5 uppercase tracking-wider opacity-60">
            Welcome back! Fall Academic Term · Tue, Oct 15, 2026
          </p>
        </div>
        <button
          onClick={() => onNavigateToTab('schedule')}
          className={`flex items-center gap-2 py-2 px-4 text-xs font-bold rounded-xl transition-all border shadow-sm cursor-pointer ${
            isDark
              ? 'bg-[#1C1C16] border-[#2D2D25] text-[#D4A373] hover:bg-[#25251F]'
              : 'bg-white border-black/5 text-[#5A5A40] hover:bg-[#F5F5F0]'
          }`}
        >
          <Clock size={14} />
          <span>View Week Schedule</span>
        </button>
      </div>

      {/* Main Aggregated Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Attendance Percentage Indicator */}
        <div className={`rounded-[32px] p-6 border flex flex-col justify-between hover-lift transition-all ${
          isDark ? 'bg-[#25251F] border-[#2D2D25]' : 'bg-white border-black/5'
        }`}>
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">Overall Standing</span>
            <span className={`p-1 rounded-lg ${isDark ? 'bg-[#829653]/10 text-[#829653]' : 'bg-[#606C38]/10 text-[#606C38]'}`}>
              <TrendingUp size={16} />
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <h3 className={`font-serif italic text-4xl font-normal ${isOverallSafe ? (isDark ? 'text-[#829653]' : 'text-[#606C38]') : (isDark ? 'text-[#D18E4E]' : 'text-[#BC6C25]')}`}>
              {overallPercent.toFixed(1)}%
            </h3>
            <span className="text-xs opacity-50">attended</span>
          </div>
          {/* Visual Mini Progress Bar */}
          <div className="w-full bg-black/5 dark:bg-[#1C1C16] h-1.5 rounded-full mt-4 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isOverallSafe ? 'bg-[#606C38] dark:bg-[#829653]' : 'bg-[#BC6C25] dark:bg-[#D18E4E]'
              }`}
              style={{ width: `${Math.min(100, overallPercent)}%` }}
            />
          </div>
          <p className="text-[10px] opacity-65 mt-2">
            {isOverallSafe 
              ? `✓ Perfect! You are above the average target threshold of ${Math.round(avgRequired)}%.` 
              : `⚠️ Warning: Below your required average target threshold of ${Math.round(avgRequired)}%.`}
          </p>
        </div>

        {/* Next Scheduled Class Announcement Card */}
        <div className={`rounded-[32px] p-6 border flex flex-col justify-between hover-lift transition-all ${
          isDark ? 'bg-[#25251F] border-[#2D2D25]' : 'bg-white border-black/5'
        }`}>
          <div className="flex justify-between items-start mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">Next Scheduled Class</span>
            <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase ${
              isDark ? 'bg-[#8C8C70]/15 text-[#D4A373]' : 'bg-[#5A5A40]/10 text-[#5A5A40]'
            }`}>
              {upcomingSlot?.type || 'Lecture'}
            </span>
          </div>
          <div className="mt-2">
            <h4 className={`font-serif italic text-lg leading-tight ${isDark ? 'text-white' : 'text-[#2D2D2D]'}`}>
              {upcomingSlot ? (courses.find(c => c.id === upcomingSlot.courseId)?.name || upcomingSlot.courseName) : 'No Upcoming Class'}
            </h4>
            <div className="flex items-center gap-2 mt-1.5 text-xs opacity-70">
              <Clock size={12} />
              <span>{upcomingSlot?.startTime} - {upcomingSlot?.endTime} (In 30 mins)</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] opacity-60 mt-3 border-t border-black/[0.04] pt-2">
            <MapPin size={10} />
            <span>Room: {upcomingSlot?.room || 'TBA'}</span>
          </div>
        </div>

        {/* Critical Alerts Card */}
        <div className={`rounded-[32px] p-6 border flex flex-col justify-between hover-lift transition-all ${
          dangerCourses.length > 0
            ? isDark ? 'border-l-4 border-l-[#D18E4E] bg-[#25251F] border-[#2D2D25]' : 'border-l-4 border-l-[#BC6C25] bg-white border-black/5'
            : isDark ? 'bg-[#25251F] border-[#2D2D25]' : 'bg-white border-black/5'
        }`}>
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">Alerts & Deficits</span>
            <span className={`p-1 rounded-lg ${dangerCourses.length > 0 ? (isDark ? 'bg-[#D18E4E]/10 text-[#D18E4E]' : 'bg-[#BC6C25]/10 text-[#BC6C25]') : (isDark ? 'bg-[#829653]/10 text-[#829653]' : 'bg-[#606C38]/10 text-[#606C38]')}`}>
              <AlertTriangle size={16} />
            </span>
          </div>
          <div className="mt-2">
            <h4 className={`font-serif italic text-3xl font-normal ${dangerCourses.length > 0 ? (isDark ? 'text-[#D18E4E]' : 'text-[#BC6C25]') : (isDark ? 'text-[#829653]' : 'text-[#606C38]')}`}>
              {dangerCourses.length}
            </h4>
            <p className="text-xs opacity-75 mt-1">
              {dangerCourses.length > 0
                ? `${dangerCourses.length} subject${dangerCourses.length > 1 ? 's are' : ' is'} below required target percent.`
                : 'All courses satisfy the required attendance threshold.'}
            </p>
          </div>
          <div className="text-[9px] opacity-60 mt-2 border-t border-black/[0.04] pt-2 flex justify-between items-center">
            <span>Critical limit: &lt; 75%</span>
            {dangerCourses.length > 0 && (
              <button
                onClick={() => onNavigateToTab('courses')}
                className="font-bold underline text-[8px] uppercase tracking-wider cursor-pointer hover:opacity-85"
              >
                Fix Deficit
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Main Dual Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Quick Tactile Attendance Logger (Left/Center Column - Spans 2 cols) */}
        <div className={`lg:col-span-2 rounded-[32px] p-6 border flex flex-col ${
          isDark ? 'bg-[#25251F] border-[#2D2D25]' : 'bg-white border-black/5'
        }`}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className={`font-serif italic text-lg ${isDark ? 'text-white' : 'text-[#2D2D2D]'}`}>
                Quick Attendance Tracker
              </h3>
              <p className="text-[10px] opacity-65 mt-0.5">
                Instantly check-in or skip courses right from your home dashboard.
              </p>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-50">
              {courses.length} courses active
            </span>
          </div>

          <div className="space-y-4 flex-1">
            {courses.map((course) => {
              const calc = calculateAttendance(course.held, course.attended, course.required_percent);
              
              let statusColor = isDark ? 'text-[#829653]' : 'text-[#606C38]';
              let statusBg = isDark ? 'bg-[#829653]/10' : 'bg-[#606C38]/10';
              let statusLabel = 'Safe';

              if (!calc.isSafe) {
                if (calc.currentPercent >= course.required_percent - 5) {
                  statusColor = 'text-[#DDA15E]';
                  statusBg = 'bg-[#DDA15E]/10';
                  statusLabel = 'Warning';
                } else {
                  statusColor = isDark ? 'text-[#D18E4E]' : 'text-[#BC6C25]';
                  statusBg = isDark ? 'bg-[#D18E4E]/10' : 'bg-[#BC6C25]/10';
                  statusLabel = 'Critical';
                }
              }

              return (
                <div
                  key={course.id}
                  className={`p-4 rounded-2xl border transition-all hover:scale-[1.005] ${
                    isDark ? 'bg-[#1C1C16] border-[#2D2D25]' : 'bg-[#F5F5F0] border-black/5'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    
                    {/* Left: Course details and percentage gauge */}
                    <div className="flex items-center gap-4">
                      {/* Circle percentage tracker */}
                      <div className="w-12 h-12 rounded-full border-2 border-dashed flex items-center justify-center border-[#8C8C70]/40 shrink-0">
                        <span className={`font-serif italic text-xs font-bold ${statusColor}`}>
                          {calc.currentPercent.toFixed(0)}%
                        </span>
                      </div>
                      
                      <div>
                        <h4 className={`font-serif italic font-bold text-sm leading-snug ${isDark ? 'text-white' : 'text-[#2D2D2D]'}`}>
                          {course.name}
                        </h4>
                        <div className="flex items-center flex-wrap gap-2 mt-1">
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${statusBg} ${statusColor}`}>
                            {statusLabel}
                          </span>
                          <span className="text-[10px] opacity-60">
                            Logged: {course.attended}/{course.held} lectures
                          </span>
                          <span className="text-[10px] opacity-30">•</span>
                          {editingTargetId === course.id ? (
                            <span className="flex items-center gap-1">
                              <span className="text-[10px] opacity-60">Target:</span>
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={tempTargetVal}
                                onChange={(e) => setTempTargetVal(Number(e.target.value))}
                                className={`w-12 px-1 py-0.5 text-[10px] font-bold rounded border outline-none ${
                                  isDark ? 'bg-[#1C1C16] border-[#8C8C70]/40 text-white' : 'bg-white border-[#5A5A40]/40 text-stone-900'
                                }`}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    handleSaveTarget(course.id);
                                  } else if (e.key === 'Escape') {
                                    setEditingTargetId(null);
                                  }
                                }}
                                autoFocus
                              />
                              <span className="text-[10px] opacity-60">%</span>
                              <button
                                onClick={() => handleSaveTarget(course.id)}
                                className="text-emerald-500 hover:text-emerald-400 font-bold text-[10px]"
                              >
                                Save
                              </button>
                            </span>
                          ) : (
                            <button
                              onClick={() => {
                                setEditingTargetId(course.id);
                                setTempTargetVal(course.required_percent);
                              }}
                              className="text-[10px] opacity-60 hover:opacity-100 flex items-center gap-1 group/btn cursor-pointer"
                              title="Click to edit course target percentage"
                            >
                              <span>Target: <strong>{course.required_percent}%</strong></span>
                              <span className="text-[8px] opacity-40 group-hover/btn:opacity-100 underline decoration-dotted">Edit</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Logging Checkboxes / Quick Action */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleQuickIncrement(course.id, 'attended')}
                        className={`flex-1 sm:flex-none py-1.5 px-4 font-bold rounded-xl transition-all cursor-pointer text-xs flex items-center justify-center gap-1.5 ${
                          isDark
                            ? 'bg-[#829653] text-[#1C1C16] hover:opacity-90'
                            : 'bg-[#606C38] text-white hover:opacity-95'
                        }`}
                        title="Attended today's class lecture"
                      >
                        <CheckCircle size={12} />
                        <span>Attended</span>
                      </button>
                      
                      <button
                        onClick={() => handleQuickIncrement(course.id, 'skipped')}
                        className={`flex-1 sm:flex-none py-1.5 px-4 font-bold rounded-xl transition-all cursor-pointer text-xs flex items-center justify-center gap-1.5 ${
                          isDark
                            ? 'bg-[#D18E4E] text-[#1C1C16] hover:opacity-90'
                            : 'bg-[#BC6C25] text-white hover:opacity-95'
                        }`}
                        title="Absent / Skipped today's class lecture"
                      >
                        <AlertTriangle size={12} />
                        <span>Skipped</span>
                      </button>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Goal Meter & Quick Tips */}
        <div className="space-y-6">
          
          {/* Term Target Gauge */}
          <div className={`rounded-[32px] p-6 border ${
            isDark ? 'bg-[#25251F] border-[#2D2D25]' : 'bg-white border-black/5'
          }`}>
            <h3 className="text-[10px] font-bold uppercase tracking-wider opacity-60 mb-4">Academic Target progress</h3>
            
            <div className="flex flex-col items-center justify-center py-4 relative">
              {/* Radial Progress Graphic */}
              <div className="relative w-32 h-32 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="52"
                    stroke={isDark ? '#1C1C16' : '#F5F5F0'}
                    strokeWidth="8"
                    fill="transparent"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="52"
                    stroke={isDark ? '#829653' : '#606C38'}
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 52}`}
                    strokeDashoffset={`${2 * Math.PI * 52 * (1 - Math.min(100, overallPercent) / 100)}`}
                    strokeLinecap="round"
                    className="transition-all duration-700 ease-out"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className={`font-serif italic text-2xl font-extrabold ${isDark ? 'text-white' : 'text-[#2D2D2D]'}`}>
                    {overallPercent.toFixed(0)}%
                  </span>
                  <span className="text-[8px] uppercase tracking-widest opacity-60 font-bold">Overall</span>
                </div>
              </div>

              {/* Requirement bar label */}
              <div className="mt-4 text-center">
                {isEditingGlobalTarget ? (
                  <div className="flex items-center justify-center gap-1.5">
                    <span className="text-[10px] opacity-60">Global target:</span>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={globalTargetVal}
                      onChange={(e) => setGlobalTargetVal(Number(e.target.value))}
                      className={`w-12 px-1 py-0.5 text-[10px] font-bold rounded border outline-none ${
                        isDark ? 'bg-[#1C1C16] border-[#8C8C70]/40 text-white' : 'bg-white border-[#5A5A40]/40 text-stone-900'
                      }`}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSaveGlobalTarget();
                        } else if (e.key === 'Escape') {
                          setIsEditingGlobalTarget(false);
                        }
                      }}
                      autoFocus
                    />
                    <span className="text-[10px] opacity-60">%</span>
                    <button
                      onClick={handleSaveGlobalTarget}
                      className="text-emerald-500 hover:text-emerald-400 font-bold text-[10px]"
                    >
                      Apply
                    </button>
                    <button
                      onClick={() => setIsEditingGlobalTarget(false)}
                      className="text-stone-400 hover:text-stone-300 font-bold text-[10px]"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setIsEditingGlobalTarget(true);
                      setGlobalTargetVal(Math.round(avgRequired));
                    }}
                    className={`px-2 py-1 rounded text-[10px] font-bold transition-all hover:scale-98 cursor-pointer flex items-center gap-1.5 mx-auto ${
                      isOverallSafe ? 'bg-[#606C38]/15 text-[#606C38]' : 'bg-[#BC6C25]/15 text-[#BC6C25]'
                    }`}
                    title="Click to edit and apply target to all courses"
                  >
                    <span>Required Target: {Math.round(avgRequired)}%</span>
                    <span className="text-[8px] opacity-50 underline decoration-dotted">Edit All</span>
                  </button>
                )}
                <p className="text-[10px] opacity-60 mt-2 max-w-[200px] mx-auto">
                  Calculated as the average necessary percentage to sit in end-term examinations.
                </p>
              </div>
            </div>
          </div>

          {/* Notes & Reminders Panel */}
          <div
            id="notes-panel-container"
            className={`rounded-[32px] p-6 border flex flex-col justify-between ${
              isDark ? 'bg-[#25251F] border-[#2D2D25]' : 'bg-white border-black/5'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-4 border-b border-black/[0.04] dark:border-[#2D2D25] pb-3">
                <div className="flex items-center gap-2">
                  <span className={`p-1.5 rounded-lg ${
                    isDark ? 'bg-[#829653]/10 text-[#829653]' : 'bg-[#606C38]/10 text-[#606C38]'
                  }`}>
                    <Pin size={14} className="rotate-45" />
                  </span>
                  <h3 className={`font-serif italic text-sm font-bold ${isDark ? 'text-white' : 'text-[#2D2D2D]'}`}>
                    Notes & Reminders
                  </h3>
                </div>
                <span className="text-[10px] uppercase tracking-wider opacity-60 font-mono font-bold">
                  {notes.filter(n => !n.completed).length} Pending
                </span>
              </div>

              {/* Notes List */}
              <div className="space-y-2.5 max-h-[160px] overflow-y-auto pr-1 flex-1 custom-scrollbar">
                {notes.length === 0 ? (
                  <div className="py-6 text-center">
                    <p className="text-[11px] opacity-50 italic">
                      No active reminders. Type below to pin a study goal or class task...
                    </p>
                  </div>
                ) : (
                  notes.map((note) => (
                    <div
                      key={note.id}
                      className={`flex items-start justify-between gap-2.5 p-2.5 rounded-xl border transition-all ${
                        note.completed
                          ? 'opacity-40 line-through border-transparent bg-transparent'
                          : isDark
                            ? 'bg-[#1C1C16] border-[#2D2D25] hover:border-[#8C8C70]/30'
                            : 'bg-[#F5F5F0] border-black/[0.03] hover:border-[#5A5A40]/30'
                      }`}
                    >
                      <button
                        onClick={() => handleToggleNote(note.id)}
                        className={`mt-0.5 cursor-pointer shrink-0 transition-colors ${
                          isDark ? 'text-[#829653] hover:text-[#9BB268]' : 'text-[#606C38] hover:text-[#7A8A4B]'
                        }`}
                      >
                        {note.completed ? <CheckSquare size={14} /> : <Square size={14} />}
                      </button>
                      
                      <span className={`text-xs flex-1 break-words font-sans text-left ${
                        note.completed ? 'line-through text-stone-500' : isDark ? 'text-[#D1D1C6]' : 'text-[#2D2D2D]'
                      }`}>
                        {note.text}
                      </span>

                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="text-stone-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors cursor-pointer mt-0.5 shrink-0"
                        title="Delete reminder"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Notes Input Field */}
            <form id="note-add-form" onSubmit={handleAddNote} className="mt-4 pt-3 border-t border-black/[0.04] dark:border-[#2D2D25] flex gap-2">
              <input
                id="note-input"
                type="text"
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                placeholder="Add study reminder..."
                maxLength={80}
                className={`flex-grow px-3 py-2 text-xs rounded-xl border outline-none font-medium transition-all ${
                  isDark
                    ? 'bg-[#1C1C16] border-[#2D2D25] text-white focus:border-[#8C8C70]'
                    : 'bg-[#F5F5F0] border-black/5 text-[#2D2D2D] focus:bg-white focus:border-[#5A5A40]'
                }`}
              />
              <button
                id="note-submit-btn"
                type="submit"
                disabled={!newNoteText.trim()}
                className={`p-2 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                  newNoteText.trim()
                    ? isDark
                      ? 'bg-[#829653] text-[#1C1C16] hover:opacity-90'
                      : 'bg-[#606C38] text-white hover:opacity-95'
                    : 'bg-stone-300 text-stone-500 dark:bg-stone-800 dark:text-stone-600 cursor-not-allowed opacity-50'
                }`}
              >
                <Plus size={16} />
              </button>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
}
