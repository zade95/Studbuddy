import React, { useState, useEffect } from 'react';
import { X, Play, Info, AlertTriangle, CheckCircle, HelpCircle } from 'lucide-react';
import { Course } from '../types';
import { calculateAttendance } from '../lib/attendance';

interface PredictionCalculatorProps {
  courses: Course[];
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
}

export default function PredictionCalculator({
  courses,
  isOpen,
  onClose,
  isDark,
}: PredictionCalculatorProps) {
  const [selectedCourseId, setSelectedCourseId] = useState<string>('all');
  const [skipSimCount, setSkipSimCount] = useState<number>(0);
  const [attendSimCount, setAttendSimCount] = useState<number>(0);

  // Reset sliders when course changes
  useEffect(() => {
    setSkipSimCount(0);
    setAttendSimCount(0);
  }, [selectedCourseId]);

  if (!isOpen) return null;

  // Compute aggregate stats for "All Courses"
  const totalHeld = courses.reduce((acc, c) => acc + c.held, 0);
  const totalAttended = courses.reduce((acc, c) => acc + c.attended, 0);
  const avgRequired = courses.length > 0 ? Math.round(courses.reduce((acc, c) => acc + c.required_percent, 0) / courses.length) : 75;

  const activeCourse = selectedCourseId === 'all' 
    ? {
        id: 'all',
        name: 'All Subjects (Combined Average)',
        held: totalHeld,
        attended: totalAttended,
        required_percent: avgRequired,
        professor: 'Combined Average',
        credits: courses.reduce((acc, c) => acc + c.credits, 0),
        color: 'indigo'
      }
    : courses.find(c => c.id === selectedCourseId);

  if (!activeCourse) return null;

  // Perform calculations for current state
  const currentCalc = calculateAttendance(activeCourse.held, activeCourse.attended, activeCourse.required_percent);

  // Perform calculations for "Skip Simulation"
  // Skipping increments only held count, attended stays same
  const simulatedSkipHeld = activeCourse.held + skipSimCount;
  const simulatedSkipCalc = calculateAttendance(simulatedSkipHeld, activeCourse.attended, activeCourse.required_percent);

  // Perform calculations for "Attend Simulation"
  // Attending consecutively increments both held and attended counts
  const simulatedAttendHeld = activeCourse.held + attendSimCount;
  const simulatedAttendAttended = activeCourse.attended + attendSimCount;
  const simulatedAttendCalc = calculateAttendance(simulatedAttendHeld, simulatedAttendAttended, activeCourse.required_percent);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className={`w-full max-w-2xl rounded-[32px] border flex flex-col max-h-[90vh] overflow-hidden transition-all ${
        isDark 
          ? 'bg-[#25251F] border-[#2D2D25] text-[#D1D1C6] shadow-lg' 
          : 'bg-white border-black/5 text-[#2D2D2D] shadow-sm'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-black/5 dark:border-[#2D2D25]">
          <div className="flex items-center gap-2">
            <span className={`p-1.5 rounded-xl text-white ${isDark ? 'bg-[#8C8C70]' : 'bg-[#5A5A40]'}`}>
              <Play size={18} />
            </span>
            <h2 className="font-serif italic text-lg text-slate-800 dark:text-white">Attendance Prediction Tool</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-[#1C1C16] transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Subject Picker */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-2 opacity-75">
              Select Subject to Simulate
            </label>
            <select
              value={selectedCourseId}
              id="calc-course-selector"
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className={`w-full py-2.5 px-3 rounded-2xl border font-bold text-sm outline-none transition-all ${
                isDark 
                  ? 'bg-[#1C1C16] border-[#2D2D25] text-white focus:border-[#8C8C70]' 
                  : 'bg-[#F5F5F0] border-black/5 text-[#2D2D2D] focus:bg-white focus:border-[#5A5A40]'
              }`}
            >
              <option value="all">All Subjects (Combined Average)</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>
                  {course.name} ({course.professor})
                </option>
              ))}
            </select>
          </div>

          {/* Current Status Summary */}
          <div className={`p-4 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
            isDark ? 'bg-[#1C1C16] border-[#2D2D25]' : 'bg-[#F5F5F0] border-black/5'
          }`}>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">Selected Course Status</span>
              <h3 className="font-serif italic text-base">{activeCourse.name}</h3>
              <p className="text-xs opacity-75 mt-0.5">
                Current Class Ratio: <strong className={isDark ? 'text-[#D4A373]' : 'text-[#5A5A40]'}>{activeCourse.attended}</strong> / {activeCourse.held} held (Goal: {activeCourse.required_percent}%)
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-60 block">Current %</span>
                <span className={`font-serif italic font-extrabold text-2xl ${
                  currentCalc.isSafe 
                    ? isDark ? 'text-[#829653]' : 'text-[#606C38]' 
                    : currentCalc.currentPercent >= activeCourse.required_percent - 5 
                      ? 'text-[#DDA15E]' 
                      : isDark ? 'text-[#D18E4E]' : 'text-[#BC6C25]'
                }`}>
                  {currentCalc.currentPercent.toFixed(1)}%
                </span>
              </div>
              <div className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 border ${
                currentCalc.isSafe 
                  ? isDark ? 'bg-[#829653]/15 text-[#829653] border-[#829653]/20' : 'bg-[#606C38]/10 text-[#606C38] border-[#606C38]/20' 
                  : isDark ? 'bg-[#D18E4E]/15 text-[#D18E4E] border-[#D18E4E]/20' : 'bg-[#BC6C25]/10 text-[#BC6C25] border-[#BC6C25]/20'
              }`}>
                {currentCalc.isSafe ? (
                  <>
                    <CheckCircle size={14} />
                    <span>Safe Zone</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle size={14} />
                    <span>Danger Zone</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* SIMULATION CONTROLS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* SKIP SIMULATOR (Only really relevant if currently safe or looking to see threshold) */}
            <div className={`p-5 rounded-2xl border flex flex-col justify-between ${
              isDark ? 'bg-[#1C1C16] border-[#2D2D25]' : 'bg-white border-black/5'
            }`}>
              <div>
                <div className={`flex items-center gap-1.5 mb-2 ${isDark ? 'text-[#D18E4E]' : 'text-[#BC6C25]'}`}>
                  <AlertTriangle size={16} />
                  <h4 className="font-bold text-sm">Skip Simulator</h4>
                </div>
                <p className="text-xs opacity-75 leading-relaxed mb-4">
                  What happens if you miss the upcoming classes? Drag to see when you cross the danger threshold.
                </p>
                
                {/* Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span>Skip next classes:</span>
                    <span className={`font-mono text-sm ${isDark ? 'text-[#D18E4E]' : 'text-[#BC6C25]'}`}>{skipSimCount} classes</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="30" 
                    value={skipSimCount}
                    onChange={(e) => {
                      setSkipSimCount(parseInt(e.target.value));
                      if (attendSimCount > 0) setAttendSimCount(0);
                    }}
                    className={`w-full cursor-pointer h-1.5 bg-black/5 dark:bg-[#25251F] rounded-lg accent-[#BC6C25]`}
                  />
                </div>
              </div>

              {/* Simulation Result */}
              {skipSimCount > 0 && (
                <div className={`mt-5 p-3.5 rounded-2xl border flex flex-col justify-between gap-2 text-xs ${
                  simulatedSkipCalc.isSafe 
                    ? isDark ? 'bg-[#829653]/10 border-[#829653]/25' : 'bg-[#606C38]/5 border-[#606C38]/15' 
                    : isDark ? 'bg-[#D18E4E]/10 border-[#D18E4E]/25' : 'bg-[#BC6C25]/5 border-[#BC6C25]/15'
                }`}>
                  <div className="flex justify-between items-center">
                    <span>Simulated Attendance:</span>
                    <span className={`font-serif italic font-bold ${simulatedSkipCalc.isSafe ? isDark ? 'text-[#829653]' : 'text-[#606C38]' : isDark ? 'text-[#D18E4E]' : 'text-[#BC6C25]'}`}>
                      {simulatedSkipCalc.currentPercent.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center opacity-75">
                    <span>Required Attendance:</span>
                    <span className="font-mono">{activeCourse.required_percent}%</span>
                  </div>
                  <p className="font-medium mt-1 leading-relaxed">
                    {simulatedSkipCalc.isSafe ? (
                      <span className={isDark ? 'text-[#829653]' : 'text-[#606C38]'}>
                        ✅ You remain in the Safe Zone! You can still skip {simulatedSkipCalc.safeSkipCount} more classes safely.
                      </span>
                    ) : (
                      <span className={`font-bold flex items-start gap-1 ${isDark ? 'text-[#D18E4E]' : 'text-[#BC6C25]'}`}>
                        <span>⚠️ Attendance falls below required! You would need to attend {simulatedSkipCalc.classesNeededCount} consecutive classes afterwards to recover.</span>
                      </span>
                    )}
                  </p>
                </div>
              )}
            </div>

            {/* ATTEND SIMULATOR */}
            <div className={`p-5 rounded-2xl border flex flex-col justify-between ${
              isDark ? 'bg-[#1C1C16] border-[#2D2D25]' : 'bg-white border-black/5'
            }`}>
              <div>
                <div className={`flex items-center gap-1.5 mb-2 ${isDark ? 'text-[#829653]' : 'text-[#606C38]'}`}>
                  <CheckCircle size={16} />
                  <h4 className="font-bold text-sm">Attendance Recovery Simulator</h4>
                </div>
                <p className="text-xs opacity-75 leading-relaxed mb-4">
                  How many classes must you attend in a row to hit your target? Drag to map your recovery plan.
                </p>
                
                {/* Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span>Attend consecutively:</span>
                    <span className={`font-mono text-sm ${isDark ? 'text-[#829653]' : 'text-[#606C38]'}`}>+{attendSimCount} classes</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="40" 
                    value={attendSimCount}
                    onChange={(e) => {
                      setAttendSimCount(parseInt(e.target.value));
                      if (skipSimCount > 0) setSkipSimCount(0);
                    }}
                    className="w-full cursor-pointer h-1.5 bg-black/5 dark:bg-[#25251F] rounded-lg accent-[#606C38]"
                  />
                </div>
              </div>

              {/* Simulation Result */}
              {attendSimCount > 0 && (
                <div className={`mt-5 p-3.5 rounded-2xl border flex flex-col justify-between gap-2 text-xs ${
                  simulatedAttendCalc.isSafe 
                    ? isDark ? 'bg-[#829653]/10 border-[#829653]/25' : 'bg-[#606C38]/5 border-[#606C38]/15' 
                    : isDark ? 'bg-[#D18E4E]/10 border-[#D18E4E]/25' : 'bg-[#BC6C25]/5 border-[#BC6C25]/15'
                }`}>
                  <div className="flex justify-between items-center">
                    <span>Simulated Attendance:</span>
                    <span className={`font-serif italic font-bold ${simulatedAttendCalc.isSafe ? isDark ? 'text-[#829653]' : 'text-[#606C38]' : isDark ? 'text-[#D18E4E]' : 'text-[#BC6C25]'}`}>
                      {simulatedAttendCalc.currentPercent.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center opacity-75">
                    <span>Target Goal:</span>
                    <span className="font-mono">{activeCourse.required_percent}%</span>
                  </div>
                  <p className="font-medium mt-1 leading-relaxed">
                    {simulatedAttendCalc.isSafe ? (
                      <span className={`font-bold ${isDark ? 'text-[#829653]' : 'text-[#606C38]'}`}>
                        🎉 Success! This sequence secures your Safe Zone! You would have {simulatedAttendCalc.safeSkipCount} safe skip days after.
                      </span>
                    ) : (
                      <span className="text-[#DDA15E]">
                        📈 Nice progress! You need to attend {simulatedAttendCalc.classesNeededCount} more classes consecutively to hit the required threshold.
                      </span>
                    )}
                  </p>
                </div>
              )}
            </div>

          </div>

          {/* Explanation Alert */}
          <div className={`p-4 rounded-2xl border flex gap-3 text-xs leading-relaxed ${
            isDark ? 'bg-[#1C1C16]/50 border-[#2D2D25] text-[#D1D1C6]' : 'bg-[#F5F5F0] border-black/5 text-[#5A5A40]'
          }`}>
            <Info size={18} className={`shrink-0 ${isDark ? 'text-[#D4A373]' : 'text-[#5A5A40]'}`} />
            <div>
              <strong className={isDark ? 'text-white' : 'text-[#2D2D2D]'}>Algebraic Theory:</strong>
              <p className="mt-1">
                Your safe skip count utilizes exact algebra. For any skipped class, the classes-held count increments but attended-count remains static. Conversely, consecutive recoveries increment both metrics simultaneously. This predictor uses perfect math, not averages.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-black/5 dark:bg-[#1C1C16] border-t border-black/5 dark:border-[#2D2D25] flex justify-end">
          <button
            onClick={onClose}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold text-white transition-all cursor-pointer hover:opacity-95 ${
              isDark ? 'bg-[#8C8C70] text-[#1C1C16]' : 'bg-[#5A5A40] text-white'
            }`}
          >
            Close Predictor
          </button>
        </div>
      </div>
    </div>
  );
}
