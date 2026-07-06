import React, { useState } from 'react';
import { TrendingUp, AlertTriangle, CheckCircle, BookOpen, Calendar, HelpCircle, MapPin, Clock } from 'lucide-react';
import { Course } from '../types';
import { calculateAttendance } from '../lib/attendance';

interface AnalyticsViewProps {
  courses: Course[];
  isDark: boolean;
}

export default function AnalyticsView({ courses, isDark }: AnalyticsViewProps) {
  const [selectedDayIdx, setSelectedDayIdx] = useState<number>(8); // Default to Tuesday Oct 13
  // 1. Calculations
  const totalHeld = courses.reduce((acc, c) => acc + c.held, 0);
  const totalAttended = courses.reduce((acc, c) => acc + c.attended, 0);
  
  const overallPercent = totalHeld > 0 ? (totalAttended / totalHeld) * 100 : 100;
  
  // Calculate average target requirement
  const avgRequired = courses.length > 0 
    ? courses.reduce((acc, c) => acc + c.required_percent, 0) / courses.length 
    : 75;

  // Let's compute total classes needed to recover across all subjects currently in danger
  const dangerCourses = courses.filter(c => {
    const calc = calculateAttendance(c.held, c.attended, c.required_percent);
    return !calc.isSafe;
  });

  const totalRecoveryNeeded = dangerCourses.reduce((acc, c) => {
    const calc = calculateAttendance(c.held, c.attended, c.required_percent);
    return acc + calc.classesNeededCount;
  }, 0);

  // Overall is safe?
  const isOverallSafe = overallPercent >= avgRequired;

  // Theme-aware semantic colors
  const safeBg = isDark ? 'bg-[#829653]/10' : 'bg-[#606C38]/10';
  const safeText = isDark ? 'text-[#829653]' : 'text-[#606C38]';
  const dangerBg = isDark ? 'bg-[#D18E4E]/10' : 'bg-[#BC6C25]/10';
  const dangerText = isDark ? 'text-[#D18E4E]' : 'text-[#BC6C25]';

  // October 2026 simulated classes log data
  const SIMULATED_DAYS = [
    // Week 1
    { date: 'Monday, Oct 5', day: 'Mon', courses: [{ name: 'Data Structures', status: 'attended', time: '09:00 - 10:30' }] },
    { date: 'Tuesday, Oct 6', day: 'Tue', courses: [{ name: 'Advanced Calculus', status: 'attended', time: '10:00 - 12:00' }, { name: 'Modern Physics', status: 'attended', time: '14:00 - 15:30' }] },
    { date: 'Wednesday, Oct 7', day: 'Wed', courses: [{ name: 'Data Structures', status: 'skipped', time: '09:00 - 10:30' }] },
    { date: 'Thursday, Oct 8', day: 'Thu', courses: [{ name: 'Microeconomics', status: 'attended', time: '11:00 - 12:30' }] },
    { date: 'Friday, Oct 9', day: 'Fri', courses: [{ name: 'Modern Physics', status: 'attended', time: '10:00 - 11:30' }] },
    { date: 'Saturday, Oct 10', day: 'Sat', courses: [] },
    { date: 'Sunday, Oct 11', day: 'Sun', courses: [] },

    // Week 2
    { date: 'Monday, Oct 12', day: 'Mon', courses: [{ name: 'Data Structures', status: 'attended', time: '09:00 - 10:30' }] },
    { date: 'Tuesday, Oct 13', day: 'Tue', courses: [{ name: 'Advanced Calculus', status: 'attended', time: '10:00 - 12:00' }, { name: 'Modern Physics', status: 'attended', time: '14:00 - 15:30' }] },
    { date: 'Wednesday, Oct 14', day: 'Wed', courses: [{ name: 'Data Structures', status: 'attended', time: '09:00 - 10:30' }] },
    { date: 'Thursday, Oct 15', day: 'Thu', courses: [{ name: 'Microeconomics', status: 'skipped', time: '11:00 - 12:30' }] },
    { date: 'Friday, Oct 16', day: 'Fri', courses: [{ name: 'Modern Physics', status: 'attended', time: '10:00 - 11:30' }] },
    { date: 'Saturday, Oct 17', day: 'Sat', courses: [] },
    { date: 'Sunday, Oct 18', day: 'Sun', courses: [] },

    // Week 3
    { date: 'Monday, Oct 19', day: 'Mon', courses: [{ name: 'Data Structures', status: 'skipped', time: '09:00 - 10:30' }] },
    { date: 'Tuesday, Oct 20', day: 'Tue', courses: [{ name: 'Advanced Calculus', status: 'skipped', time: '10:00 - 12:00' }, { name: 'Modern Physics', status: 'attended', time: '14:00 - 15:30' }] },
    { date: 'Wednesday, Oct 21', day: 'Wed', courses: [{ name: 'Data Structures', status: 'attended', time: '09:00 - 10:30' }] },
    { date: 'Thursday, Oct 22', day: 'Thu', courses: [{ name: 'Microeconomics', status: 'attended', time: '11:00 - 12:30' }] },
    { date: 'Friday, Oct 23', day: 'Fri', courses: [{ name: 'Modern Physics', status: 'attended', time: '10:00 - 11:30' }] },
    { date: 'Saturday, Oct 24', day: 'Sat', courses: [] },
    { date: 'Sunday, Oct 25', day: 'Sun', courses: [] },

    // Week 4
    { date: 'Monday, Oct 26', day: 'Mon', courses: [{ name: 'Data Structures', status: 'attended', time: '09:00 - 10:30' }] },
    { date: 'Tuesday, Oct 27', day: 'Tue', courses: [{ name: 'Advanced Calculus', status: 'attended', time: '10:00 - 12:00' }, { name: 'Modern Physics', status: 'attended', time: '14:00 - 15:30' }] },
    { date: 'Wednesday, Oct 28', day: 'Wed', courses: [{ name: 'Data Structures', status: 'attended', time: '09:00 - 10:30' }] },
    { date: 'Thursday, Oct 29', day: 'Thu', courses: [{ name: 'Microeconomics', status: 'attended', time: '11:00 - 12:30' }] },
    { date: 'Friday, Oct 30', day: 'Fri', courses: [{ name: 'Modern Physics', status: 'attended', time: '10:00 - 11:30' }] },
    { date: 'Saturday, Oct 31', day: 'Sat', courses: [] },
    { date: 'Sunday, Nov 1', day: 'Sun', courses: [] },
  ];

  const getSimulatedDayDetails = (dayIdx: number) => {
    const rawDay = SIMULATED_DAYS[dayIdx];
    if (!rawDay) return null;

    const mappedCourses = rawDay.courses.map(rc => {
      // Find course in actual user courses by index or name
      let realCourse = courses.find(c => {
        if (rc.name === 'Advanced Calculus') return c.id === 'course-calc' || c.name === 'Advanced Calculus';
        if (rc.name === 'Data Structures') return c.id === 'course-ds' || c.name === 'Data Structures';
        if (rc.name === 'Modern Physics') return c.id === 'course-physics' || c.name === 'Modern Physics';
        if (rc.name === 'Microeconomics') return c.id === 'course-econ' || c.name === 'Microeconomics';
        return c.name.toLowerCase() === rc.name.toLowerCase();
      });

      // Index-based fallback if user completely changed the course names
      if (!realCourse) {
        if (rc.name === 'Advanced Calculus') realCourse = courses[0];
        else if (rc.name === 'Data Structures') realCourse = courses[1];
        else if (rc.name === 'Modern Physics') realCourse = courses[2];
        else if (rc.name === 'Microeconomics') realCourse = courses[3];
      }

      return {
        name: realCourse ? realCourse.name : rc.name,
        professor: realCourse ? realCourse.professor : 'TBA',
        color: realCourse ? realCourse.color : 'indigo',
        status: rc.status,
        time: rc.time,
      };
    });

    const scheduledCount = mappedCourses.length;
    const attendedCount = mappedCourses.filter(c => c.status === 'attended').length;
    const dayPercentage = scheduledCount > 0 ? (attendedCount / scheduledCount) * 100 : 0;

    return {
      ...rawDay,
      courses: mappedCourses,
      scheduledCount,
      attendedCount,
      dayPercentage,
    };
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div>
        <h2 className={`font-serif italic tracking-tight text-3xl md:text-4xl ${isDark ? 'text-[#D4A373]' : 'text-[#5A5A40]'}`}>
          Analytics Overview
        </h2>
        <p className="font-sans text-xs mt-1.5 uppercase tracking-wider opacity-60">
          Track your academic progress, recovery pathways, and attendance trends.
        </p>
      </div>

      {/* Bento Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Average Attendance Card */}
        <div className={`rounded-[32px] p-6 border flex flex-col justify-between transition-all hover-lift ${
          isDark 
            ? 'bg-[#25251F] border-[#2D2D25] text-[#D1D1C6]' 
            : 'bg-white border-black/5 text-[#2D2D2D]'
        }`}>
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-bold uppercase tracking-wider opacity-75">Average Attendance</span>
            <span className={`p-1.5 rounded-xl ${isDark ? 'bg-[#8C8C70]/10 text-[#D4A373]' : 'bg-[#5A5A40]/10 text-[#5A5A40]'}`}>
              <TrendingUp size={18} />
            </span>
          </div>
          <div>
            <div className={`font-serif italic font-normal text-4xl md:text-5xl ${isDark ? 'text-[#D4A373]' : 'text-[#5A5A40]'}`}>
              {overallPercent.toFixed(1)}%
            </div>
            <div className="flex items-center gap-2 mt-3">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                isOverallSafe ? `${safeBg} ${safeText}` : `${dangerBg} ${dangerText}`
              }`}>
                {isOverallSafe ? 'Safe Zone' : 'Danger Zone'}
              </span>
              <span className="text-xs opacity-75 font-serif italic">
                Target average: {Math.round(avgRequired)}%
              </span>
            </div>
          </div>
        </div>

        {/* Total Classes Logged Card */}
        <div className={`rounded-[32px] p-6 border flex flex-col justify-between transition-all hover-lift ${
          isDark 
            ? 'bg-[#25251F] border-[#2D2D25] text-[#D1D1C6]' 
            : 'bg-white border-black/5 text-[#2D2D2D]'
        }`}>
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-bold uppercase tracking-wider opacity-75">Total Class Volume</span>
            <span className={`p-1.5 rounded-xl ${isDark ? 'bg-[#8C8C70]/10 text-[#D1D1C6]' : 'bg-[#5A5A40]/10 text-[#5A5A40]'}`}>
              <BookOpen size={18} />
            </span>
          </div>
          <div>
            <div className={`font-serif italic font-normal text-4xl md:text-5xl ${isDark ? 'text-white' : 'text-[#2D2D2D]'}`}>
              {totalAttended} <span className="text-xl font-sans font-normal opacity-50">/ {totalHeld}</span>
            </div>
            <p className="text-xs opacity-75 mt-3">
              Logged class interactions across all active subjects.
            </p>
          </div>
        </div>

        {/* Classes Needed for Target Card */}
        <div className={`rounded-[32px] p-6 border-l-4 flex flex-col justify-between transition-all hover-lift ${
          totalRecoveryNeeded > 0 
            ? isDark ? 'border-l-[#D18E4E]' : 'border-l-[#BC6C25]' 
            : isDark ? 'border-l-[#829653]' : 'border-l-[#606C38]'
        } ${
          isDark 
            ? 'bg-[#25251F] border-[#2D2D25] text-[#D1D1C6]' 
            : 'bg-white border-black/5 text-[#2D2D2D]'
        }`}>
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-bold uppercase tracking-wider opacity-75">Classes Needed to Recover</span>
            <span className={`p-1.5 rounded-xl ${
              totalRecoveryNeeded > 0 ? dangerBg : safeBg
            }`}>
              <AlertTriangle size={18} className={totalRecoveryNeeded > 0 ? dangerText : safeText} />
            </span>
          </div>
          <div>
            <div className={`font-serif italic font-normal text-4xl md:text-5xl ${
              totalRecoveryNeeded > 0 ? dangerText : safeText
            }`}>
              {totalRecoveryNeeded}
            </div>
            <p className="text-xs opacity-75 mt-3">
              {totalRecoveryNeeded > 0 
                ? `Consecutive attended classes required across ${dangerCourses.length} warning courses.` 
                : 'Target achieved. Maintain current pace.'}
            </p>
          </div>
        </div>

      </div>

      {/* SVG Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Attendance Trend Line Chart (Interactive SVG) */}
        <div className={`rounded-[32px] p-6 border transition-all hover-lift ${
          isDark ? 'bg-[#25251F] border-[#2D2D25]' : 'bg-white border-black/5'
        }`}>
          <div className="flex justify-between items-center mb-5">
            <h3 className={`font-serif italic text-base ${isDark ? 'text-white' : 'text-[#2D2D2D]'}`}>
              Weekly Trend Analysis
            </h3>
            <span className="text-xs font-medium opacity-60">Last 8 Weeks</span>
          </div>
          
          {/* Custom Responsive SVG Graph */}
          <div className="w-full h-64 relative flex items-center justify-center">
            {/* Embedded custom SVG that is fluidly responsive */}
            <svg viewBox="0 0 500 220" className="w-full h-full overflow-visible">
              {/* Grids */}
              <line x1="30" y1="20" x2="480" y2="20" stroke={isDark ? '#2D2D25' : '#EAEAE0'} strokeDasharray="3" />
              <line x1="30" y1="60" x2="480" y2="60" stroke={isDark ? '#2D2D25' : '#EAEAE0'} strokeDasharray="3" />
              <line x1="30" y1="100" x2="480" y2="100" stroke={isDark ? '#2D2D25' : '#EAEAE0'} strokeDasharray="3" />
              <line x1="30" y1="140" x2="480" y2="140" stroke={isDark ? '#2D2D25' : '#EAEAE0'} strokeDasharray="3" />
              <line x1="30" y1="180" x2="480" y2="180" stroke={isDark ? '#2D2D25' : '#EAEAE0'} strokeDasharray="3" />
              
              {/* Target Line (75%) */}
              <line x1="30" y1="100" x2="480" y2="100" stroke={isDark ? '#D18E4E' : '#BC6C25'} strokeWidth="1.5" strokeDasharray="5" />
              <text x="440" y="95" fill={isDark ? '#D18E4E' : '#BC6C25'} className="text-[8px] font-bold">75% Target</text>

              {/* Y Axis Labels */}
              <text x="5" y="25" fill="#8C8C70" className="text-[9px] font-mono">100%</text>
              <text x="5" y="65" fill="#8C8C70" className="text-[9px] font-mono">90%</text>
              <text x="5" y="105" fill="#8C8C70" className="text-[9px] font-mono">80%</text>
              <text x="5" y="145" fill="#8C8C70" className="text-[9px] font-mono">70%</text>
              <text x="5" y="185" fill="#8C8C70" className="text-[9px] font-mono">60%</text>

              {/* Filled gradient under curve */}
              <defs>
                <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={isDark ? "#8C8C70" : "#5A5A40"} stopOpacity="0.25" />
                  <stop offset="100%" stopColor={isDark ? "#8C8C70" : "#5A5A40"} stopOpacity="0.0" />
                </linearGradient>
              </defs>

              <path 
                d={`M 30,60 
                    C 60,60 70,68 94.2,68 
                    C 118.4,68 134,80 158.4,80 
                    C 182.8,80 198,92 222.6,92 
                    C 247.2,92 261.8,100 286.8,100 
                    C 311.8,100 325,96 351,96 
                    C 377,96 388,104 415.2,104 
                    C 442.4,104 450,${20 + (100 - overallPercent) * 4} 478,${20 + (100 - overallPercent) * 4}`}
                fill="none" 
                stroke={isDark ? '#8C8C70' : '#5A5A40'} 
                strokeWidth="3.5" 
                strokeLinecap="round" 
              />

              {/* Gradient Path (closing the shape) */}
              <path 
                d={`M 30,60 
                    C 60,60 70,68 94.2,68 
                    C 118.4,68 134,80 158.4,80 
                    C 182.8,80 198,92 222.6,92 
                    C 247.2,92 261.8,100 286.8,100 
                    C 311.8,100 325,96 351,96 
                    C 377,96 388,104 415.2,104 
                    C 442.4,104 450,${20 + (100 - overallPercent) * 4} 478,${20 + (100 - overallPercent) * 4} 
                    L 478,180 L 30,180 Z`}
                fill="url(#trendGrad)"
              />

              {/* Data points */}
              <circle cx="30" cy="60" r="4.5" fill={isDark ? '#25251F' : '#ffffff'} stroke={isDark ? '#8C8C70' : '#5A5A40'} strokeWidth="2.5" />
              <circle cx="94.2" cy="68" r="4.5" fill={isDark ? '#25251F' : '#ffffff'} stroke={isDark ? '#8C8C70' : '#5A5A40'} strokeWidth="2.5" />
              <circle cx="158.4" cy="80" r="4.5" fill={isDark ? '#25251F' : '#ffffff'} stroke={isDark ? '#8C8C70' : '#5A5A40'} strokeWidth="2.5" />
              <circle cx="222.6" cy="92" r="4.5" fill={isDark ? '#25251F' : '#ffffff'} stroke={isDark ? '#8C8C70' : '#5A5A40'} strokeWidth="2.5" />
              <circle cx="286.8" cy="100" r="4.5" fill={isDark ? '#25251F' : '#ffffff'} stroke={isDark ? '#8C8C70' : '#5A5A40'} strokeWidth="2.5" />
              <circle cx="351" cy="96" r="4.5" fill={isDark ? '#25251F' : '#ffffff'} stroke={isDark ? '#8C8C70' : '#5A5A40'} strokeWidth="2.5" />
              <circle cx="415.2" cy="104" r="4.5" fill={isDark ? '#25251F' : '#ffffff'} stroke={isDark ? '#8C8C70' : '#5A5A40'} strokeWidth="2.5" />
              <circle cx="478" cy={20 + (100 - overallPercent) * 4} r="5" fill={overallPercent >= 75 ? (isDark ? '#829653' : '#606C38') : (isDark ? '#D18E4E' : '#BC6C25')} stroke="#ffffff" strokeWidth="2.5" />

              {/* X Axis Labels */}
              <text x="30" y="205" fill="#8C8C70" className="text-[9px] font-bold" textAnchor="middle">Wk 1</text>
              <text x="94" y="205" fill="#8C8C70" className="text-[9px] font-bold" textAnchor="middle">Wk 2</text>
              <text x="158" y="205" fill="#8C8C70" className="text-[9px] font-bold" textAnchor="middle">Wk 3</text>
              <text x="222" y="205" fill="#8C8C70" className="text-[9px] font-bold" textAnchor="middle">Wk 4</text>
              <text x="286" y="205" fill="#8C8C70" className="text-[9px] font-bold" textAnchor="middle">Wk 5</text>
              <text x="350" y="205" fill="#8C8C70" className="text-[9px] font-bold" textAnchor="middle">Wk 6</text>
              <text x="414" y="205" fill="#8C8C70" className="text-[9px] font-bold" textAnchor="middle">Wk 7</text>
              <text x="478" y="205" fill="#8C8C70" className="text-[9px] font-bold" textAnchor="middle">Current</text>
            </svg>
          </div>
        </div>

        {/* Subject Comparison Bar Chart (Interactive SVG) */}
        <div className={`rounded-[32px] p-6 border transition-all hover-lift ${
          isDark ? 'bg-[#25251F] border-[#2D2D25]' : 'bg-white border-black/5'
        }`}>
          <div className="flex justify-between items-center mb-5">
            <h3 className={`font-serif italic text-base ${isDark ? 'text-white' : 'text-[#2D2D2D]'}`}>
              Subject Comparison
            </h3>
            <span className="text-xs font-medium opacity-60">Percent Attended</span>
          </div>

          <div className="w-full h-64 relative flex items-center justify-center">
            <svg viewBox="0 0 500 220" className="w-full h-full overflow-visible">
              {/* Grids */}
              <line x1="30" y1="20" x2="480" y2="20" stroke={isDark ? '#2D2D25' : '#EAEAE0'} strokeDasharray="3" />
              <line x1="30" y1="60" x2="480" y2="60" stroke={isDark ? '#2D2D25' : '#EAEAE0'} strokeDasharray="3" />
              <line x1="30" y1="100" x2="480" y2="100" stroke={isDark ? '#2D2D25' : '#EAEAE0'} strokeDasharray="3" />
              <line x1="30" y1="140" x2="480" y2="140" stroke={isDark ? '#2D2D25' : '#EAEAE0'} strokeDasharray="3" />
              <line x1="30" y1="180" x2="480" y2="180" stroke={isDark ? '#2D2D25' : '#EAEAE0'} strokeDasharray="3" />
              
              {/* Target Line */}
              <line x1="30" y1="100" x2="480" y2="100" stroke={isDark ? '#D18E4E' : '#BC6C25'} strokeWidth="1.5" strokeDasharray="5" />

              {/* Y Axis Labels */}
              <text x="5" y="25" fill="#8C8C70" className="text-[9px] font-mono">100%</text>
              <text x="5" y="65" fill="#8C8C70" className="text-[9px] font-mono">80%</text>
              <text x="5" y="105" fill="#8C8C70" className="text-[9px] font-mono">60%</text>
              <text x="5" y="145" fill="#8C8C70" className="text-[9px] font-mono">40%</text>
              <text x="5" y="185" fill="#8C8C70" className="text-[9px] font-mono">20%</text>

              {/* Dynamically render bars for each course */}
              {courses.map((course, idx) => {
                const step = 450 / Math.max(1, courses.length);
                const barWidth = Math.min(32, step * 0.4);
                const x = 30 + idx * step + (step - barWidth) / 2;
                
                const percent = course.held > 0 ? (course.attended / course.held) * 100 : 100;
                const barHeight = (percent / 100) * 160;
                const y = 180 - barHeight;

                // Earthy colors based on safety
                let barColor = isDark ? '#829653' : '#606C38'; // Olive Green
                if (percent < course.required_percent) {
                  barColor = percent >= course.required_percent - 5 
                    ? '#DDA15E' // Amber Sandy
                    : isDark ? '#D18E4E' : '#BC6C25'; // Clay Ochre / Red
                }

                return (
                  <g key={course.id}>
                    {/* Background track */}
                    <rect 
                      x={x} 
                      y="20" 
                      width={barWidth} 
                      height="160" 
                      rx="4" 
                      fill={isDark ? '#1C1C16' : '#F5F5F0'} 
                      opacity="0.9" 
                    />
                    {/* Active Bar */}
                    <rect 
                      x={x} 
                      y={y} 
                      width={barWidth} 
                      height={barHeight} 
                      rx="4" 
                      fill={barColor}
                      className="transition-all duration-500 ease-out hover:opacity-95"
                    />
                    {/* Value indicator above bar */}
                    <text 
                      x={x + barWidth / 2} 
                      y={y - 6} 
                      fill={isDark ? '#D1D1C6' : '#2D2D2D'} 
                      className="text-[8px] font-serif italic" 
                      textAnchor="middle"
                    >
                      {percent.toFixed(0)}%
                    </text>
                    {/* Course Label */}
                    <text 
                      x={x + barWidth / 2} 
                      y={205} 
                      fill="#8C8C70" 
                      className="text-[8px] font-sans font-bold" 
                      textAnchor="middle"
                      width={step}
                    >
                      {course.name.length > 10 ? course.name.substring(0, 8) + '..' : course.name}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

      </div>

      {/* Monthly Heatmap Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Heatmap Grid Block */}
        <div className={`lg:col-span-2 rounded-[32px] p-6 border transition-all hover-lift ${
          isDark ? 'bg-[#25251F] border-[#2D2D25]' : 'bg-white border-black/5'
        }`}>
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className={`font-serif italic text-base ${isDark ? 'text-white' : 'text-[#2D2D2D]'}`}>
                Interactive Attendance Heatmap
              </h3>
              <p className="text-[10px] opacity-60">Click any block to inspect class attendance and subject details for that day.</p>
            </div>
            <span className="text-[10px] uppercase tracking-wider font-bold opacity-50 font-serif">Oct 2026</span>
          </div>
          
          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-2.5 text-center text-[10px] font-bold uppercase tracking-wider opacity-60 mb-3">
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
            <div>Sun</div>
          </div>

          {/* Heatmap Blocks */}
          <div className="grid grid-cols-7 gap-2.5">
            {SIMULATED_DAYS.map((_, idx) => {
              const dayData = getSimulatedDayDetails(idx);
              if (!dayData) return null;

              const isSelected = selectedDayIdx === idx;
              const hasClasses = dayData.scheduledCount > 0;
              
              let cellColorClass = '';
              if (!hasClasses) {
                cellColorClass = isDark ? 'bg-[#1C1C16] opacity-35' : 'bg-[#F5F5F0] opacity-40';
              } else if (dayData.dayPercentage === 100) {
                cellColorClass = isDark ? 'bg-[#829653] text-[#1C1C16]' : 'bg-[#606C38] text-white';
              } else if (dayData.dayPercentage >= 75) {
                cellColorClass = isDark ? 'bg-[#829653]/60 text-[#1C1C16]' : 'bg-[#606C38]/60 text-white';
              } else if (dayData.dayPercentage >= 50) {
                cellColorClass = isDark ? 'bg-[#DDA15E]/60 text-[#1C1C16]' : 'bg-[#DDA15E] text-[#1C1C16]';
              } else {
                cellColorClass = isDark ? 'bg-[#D18E4E]/80 text-white' : 'bg-[#BC6C25] text-white';
              }

              return (
                <button
                  key={idx}
                  onClick={() => setSelectedDayIdx(idx)}
                  className={`aspect-square rounded-xl flex flex-col justify-between p-1.5 transition-all text-left relative cursor-pointer hover:scale-105 active:scale-95 ${cellColorClass} ${
                    isSelected 
                      ? 'ring-2 ring-[#BC6C25] ring-offset-2 dark:ring-offset-[#25251F]' 
                      : 'border border-black/[0.03]'
                  }`}
                  title={`${dayData.date}: ${dayData.scheduledCount} classes, ${dayData.attendedCount} attended (${dayData.dayPercentage.toFixed(0)}%)`}
                >
                  <span className="text-[9px] font-mono font-bold leading-none">{idx + 5}</span>
                  {hasClasses && (
                    <span className="text-[8px] font-extrabold self-end opacity-90">{dayData.dayPercentage.toFixed(0)}%</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend Explanation of Colors */}
          <div className="border-t border-black/[0.04] dark:border-white/[0.04] mt-5 pt-4">
            <span className="text-[9px] font-bold uppercase tracking-wider opacity-60 block mb-2">Color Coding Legend</span>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="flex items-center gap-1.5 text-[10px]">
                <div className={`w-3.5 h-3.5 rounded ${isDark ? 'bg-[#829653]' : 'bg-[#606C38]'}`} />
                <span className="opacity-75">100% Perfect</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px]">
                <div className={`w-3.5 h-3.5 rounded ${isDark ? 'bg-[#829653]/60' : 'bg-[#606C38]/60'}`} />
                <span className="opacity-75">&gt;= 75% SafeZone</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px]">
                <div className={`w-3.5 h-3.5 rounded ${isDark ? 'bg-[#DDA15E]/60' : 'bg-[#DDA15E]'}`} />
                <span className="opacity-75">50%-74% Amber</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px]">
                <div className={`w-3.5 h-3.5 rounded ${isDark ? 'bg-[#D18E4E]/80' : 'bg-[#BC6C25]'}`} />
                <span className="opacity-75">&lt; 50% DangerZone</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px]">
                <div className={`w-3.5 h-3.5 rounded ${isDark ? 'bg-[#1C1C16] opacity-35' : 'bg-[#F5F5F0]'}`} />
                <span className="opacity-75">No Class Scheduled</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Inspector Panel for Clicked Day */}
        <div className={`rounded-[32px] p-6 border flex flex-col justify-between ${
          isDark ? 'bg-[#25251F] border-[#2D2D25]' : 'bg-white border-black/5'
        }`}>
          {(() => {
            const dayDetails = getSimulatedDayDetails(selectedDayIdx);
            if (!dayDetails) {
              return (
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center opacity-60 font-serif italic text-xs">
                  Select a cell in the heatmap grid to inspect logs.
                </div>
              );
            }

            const hasClasses = dayDetails.scheduledCount > 0;

            return (
              <div className="flex flex-col h-full justify-between gap-5">
                <div>
                  <div className="flex items-center justify-between border-b border-black/[0.04] dark:border-white/[0.04] pb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">Day Inspector</span>
                    <span className="text-[10px] font-bold text-[#BC6C25] font-serif">{dayDetails.date}</span>
                  </div>

                  <div className="mt-4">
                    {hasClasses ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-serif italic opacity-75">Daily Summary</span>
                          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold uppercase ${
                            dayDetails.dayPercentage >= 75
                              ? isDark ? 'bg-[#829653]/15 text-[#829653]' : 'bg-[#606C38]/15 text-[#606C38]'
                              : isDark ? 'bg-[#D18E4E]/15 text-[#D18E4E]' : 'bg-[#BC6C25]/15 text-[#BC6C25]'
                          }`}>
                            {dayDetails.dayPercentage.toFixed(0)}% Attended
                          </span>
                        </div>

                        <div className="space-y-2.5">
                          {dayDetails.courses.map((c, cIdx) => (
                            <div 
                              key={cIdx} 
                              className={`p-3 rounded-2xl border ${
                                isDark ? 'bg-[#1C1C16] border-[#2D2D25]' : 'bg-[#F5F5F0] border-black/[0.02]'
                              }`}
                            >
                              <div className="flex items-start justify-between">
                                <div>
                                  <h4 className="text-xs font-serif italic font-bold">{c.name}</h4>
                                  <p className="text-[9px] opacity-60 mt-0.5">{c.professor}</p>
                                </div>
                                <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${
                                  c.status === 'attended'
                                    ? isDark ? 'bg-[#829653]/20 text-[#829653]' : 'bg-[#606C38]/15 text-[#606C38]'
                                    : isDark ? 'bg-[#D18E4E]/20 text-[#D18E4E]' : 'bg-[#BC6C25]/15 text-[#BC6C25]'
                                }`}>
                                  {c.status === 'attended' ? 'Present' : 'Absent'}
                                </span>
                              </div>
                              <div className="flex gap-2 items-center text-[9px] opacity-50 mt-2">
                                <Clock size={10} />
                                <span>{c.time}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="py-12 text-center">
                        <span className="text-2xl">🛌</span>
                        <p className="text-xs font-serif italic opacity-60 mt-2">No classes scheduled on this date.</p>
                      </div>
                    )}
                  </div>
                </div>

                {hasClasses && (
                  <div className={`p-3.5 rounded-2xl text-[10px] font-serif italic leading-normal border ${
                    dayDetails.dayPercentage >= 75
                      ? isDark ? 'bg-[#829653]/5 border-[#829653]/15 text-slate-300' : 'bg-[#606C38]/5 border-[#606C38]/15 text-stone-700'
                      : isDark ? 'bg-[#DDA15E]/5 border-[#DDA15E]/15 text-amber-100' : 'bg-[#DDA15E]/5 border-[#DDA15E]/15 text-amber-950'
                  }`}>
                    {dayDetails.dayPercentage >= 100 ? (
                      <span>You attended all scheduled classes on this day! This solidifies your buffer and maintains your safe skip counts.</span>
                    ) : dayDetails.dayPercentage >= 75 ? (
                      <span>Solid day of learning. Maintaining a high attendance helps cover for future emergency skips.</span>
                    ) : (
                      <span>Warning: attendance dropped on this day. Use the Courses tab to check if you need consecutive classes to recover!</span>
                    )}
                  </div>
                )}
              </div>
            );
          })()}
        </div>

      </div>
    </div>
  );
}
