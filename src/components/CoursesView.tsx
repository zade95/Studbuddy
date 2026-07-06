import React, { useState } from 'react';
import { Plus, Book, Trash2, Edit2, AlertCircle, CheckCircle, ChevronDown, ChevronUp, Save, Undo2, X } from 'lucide-react';
import { Course } from '../types';
import { calculateAttendance } from '../lib/attendance';

interface CoursesViewProps {
  courses: Course[];
  onAddCourse: (course: Omit<Course, 'id' | 'createdAt'>) => void;
  onDeleteCourse: (id: string) => void;
  onUpdateCourse: (
    id: string,
    held: number,
    attended: number,
    name?: string,
    professor?: string,
    credits?: number,
    required_percent?: number
  ) => void;
  isDark: boolean;
}

export default function CoursesView({
  courses,
  onAddCourse,
  onDeleteCourse,
  onUpdateCourse,
  isDark,
}: CoursesViewProps) {
  // Modal State for adding course
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newCourseName, setNewCourseName] = useState('');
  const [newProfessor, setNewProfessor] = useState('');
  const [newCredits, setNewCredits] = useState(3.0);
  const [newRequiredPercent, setNewRequiredPercent] = useState(75);
  const [newHeld, setNewHeld] = useState(0);
  const [newAttended, setNewAttended] = useState(0);
  const [addError, setAddError] = useState('');

  // Selected course details state (for logging or manual edits)
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [isEditingManual, setIsEditingManual] = useState(false);
  const [manualHeld, setManualHeld] = useState(0);
  const [manualAttended, setManualAttended] = useState(0);
  const [manualName, setManualName] = useState('');
  const [manualProfessor, setManualProfessor] = useState('');
  const [manualCredits, setManualCredits] = useState(3.0);
  const [manualRequiredPercent, setManualRequiredPercent] = useState(75);
  const [manualError, setManualError] = useState('');

  const handleOpenAdd = () => {
    setNewCourseName('');
    setNewProfessor('');
    setNewCredits(3.0);
    setNewRequiredPercent(75);
    setNewHeld(0);
    setNewAttended(0);
    setAddError('');
    setIsAddOpen(true);
  };

  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseName.trim()) {
      setAddError('Please enter a course name');
      return;
    }
    if (newAttended > newHeld) {
      setAddError('Attended classes cannot exceed classes held');
      return;
    }
    if (newHeld < 0 || newAttended < 0) {
      setAddError('Classes count cannot be negative');
      return;
    }

    // Determine default color based on percentage
    const calc = calculateAttendance(newHeld, newAttended, newRequiredPercent);
    let color = 'emerald';
    if (!calc.isSafe) {
      color = calc.currentPercent >= newRequiredPercent - 5 ? 'amber' : 'rose';
    }

    onAddCourse({
      name: newCourseName.trim(),
      professor: newProfessor.trim() || 'TBA',
      credits: Number(newCredits) || 3.0,
      held: Number(newHeld),
      attended: Number(newAttended),
      required_percent: Number(newRequiredPercent),
      color,
    });

    setIsAddOpen(false);
  };

  const handleToggleDetails = (id: string) => {
    if (selectedCourseId === id) {
      setSelectedCourseId(null);
      setIsEditingManual(false);
    } else {
      setSelectedCourseId(id);
      setIsEditingManual(false);
      const course = courses.find(c => c.id === id);
      if (course) {
        setManualHeld(course.held);
        setManualAttended(course.attended);
        setManualName(course.name);
        setManualProfessor(course.professor);
        setManualCredits(course.credits);
        setManualRequiredPercent(course.required_percent);
      }
    }
  };

  const handleQuickIncrement = (courseId: string, type: 'attended' | 'skipped') => {
    const course = courses.find(c => c.id === courseId);
    if (!course) return;

    let newH = course.held + 1;
    let newA = course.attended;

    if (type === 'attended') {
      newA += 1;
    }

    onUpdateCourse(courseId, newH, newA);
    
    // Sync state if currently editing manually
    setManualHeld(newH);
    setManualAttended(newA);
  };

  const handleSaveManual = (courseId: string) => {
    if (!manualName.trim()) {
      setManualError('Please enter a course name');
      return;
    }
    if (manualAttended > manualHeld) {
      setManualError('Attended classes cannot exceed classes held');
      return;
    }
    if (manualHeld < 0 || manualAttended < 0) {
      setManualError('Classes count cannot be negative');
      return;
    }

    onUpdateCourse(
      courseId,
      Number(manualHeld),
      Number(manualAttended),
      manualName.trim(),
      manualProfessor.trim() || 'TBA',
      Number(manualCredits) || 3.0,
      Number(manualRequiredPercent) || 75
    );
    setIsEditingManual(false);
    setManualError('');
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className={`font-serif italic tracking-tight text-3xl md:text-4xl ${isDark ? 'text-[#D4A373]' : 'text-[#5A5A40]'}`}>
            Manage Courses
          </h2>
          <p className="font-sans text-xs mt-1.5 uppercase tracking-wider opacity-60">
            Current Academic Semester · Fall 2026
          </p>
        </div>
        <div className="flex gap-2">
          <button
            id="add-course-btn"
            onClick={handleOpenAdd}
            className={`flex items-center gap-2 py-3 px-5 text-sm font-bold text-white rounded-2xl transition-transform active:scale-95 cursor-pointer shadow-sm hover:opacity-95 ${
              isDark 
                ? 'bg-[#D4A373] text-black' 
                : 'bg-[#DDA15E] text-white'
            }`}
          >
            <Plus size={18} />
            <span>Add New Course</span>
          </button>
        </div>
      </div>

      {/* Course Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => {
          const calc = calculateAttendance(course.held, course.attended, course.required_percent);
          const isExpanded = selectedCourseId === course.id;

          // Determine status text & colors under Natural Tones palette
          let statusLabel = 'Safe';
          let badgeColors = isDark 
            ? 'bg-[#829653]/15 text-[#829653] border-[#829653]/20' 
            : 'bg-[#606C38]/10 text-[#606C38] border-[#606C38]/20';
          let percentColor = isDark ? 'text-[#829653]' : 'text-[#606C38]';

          if (!calc.isSafe) {
            if (calc.currentPercent >= course.required_percent - 5) {
              statusLabel = 'Warning';
              badgeColors = 'bg-[#DDA15E]/15 text-[#DDA15E] border-[#DDA15E]/25';
              percentColor = 'text-[#DDA15E]';
            } else {
              statusLabel = 'Critical';
              badgeColors = isDark 
                ? 'bg-[#D18E4E]/15 text-[#D18E4E] border-[#D18E4E]/20' 
                : 'bg-[#BC6C25]/10 text-[#BC6C25] border-[#BC6C25]/20';
              percentColor = isDark ? 'text-[#D18E4E]' : 'text-[#BC6C25]';
            }
          }

          return (
            <div
              key={course.id}
              className={`rounded-[32px] border transition-all flex flex-col justify-between overflow-hidden ${
                isExpanded 
                  ? isDark ? 'ring-2 ring-[#8C8C70]' : 'ring-2 ring-[#5A5A40]' 
                  : 'hover-lift'
              } ${
                isDark 
                  ? 'bg-[#25251F] border-[#2D2D25]' 
                  : 'bg-white border-black/5'
              }`}
            >
              <div className="p-6 space-y-4">
                {/* Card Top: Subject details & Status badge */}
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <h3 className={`font-serif italic text-lg leading-snug ${isDark ? 'text-white' : 'text-[#2D2D2D]'}`}>
                      {course.name}
                    </h3>
                    <p className="text-xs opacity-60 mt-1 uppercase tracking-wider">{course.professor}</p>
                  </div>
                  <div className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border shrink-0 ${badgeColors}`}>
                    {statusLabel}
                  </div>
                </div>

                {/* Grid stats */}
                <div className="grid grid-cols-2 gap-4 border-t border-black/5 dark:border-[#2D2D25] pt-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider opacity-55">Credits</span>
                    <p className="font-serif italic font-bold text-sm mt-0.5">{course.credits.toFixed(1)}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider opacity-55 block">Attendance</span>
                    <p className={`font-serif italic font-extrabold text-xl mt-0.5 ${percentColor}`}>
                      {calc.currentPercent.toFixed(0)}%
                    </p>
                  </div>
                </div>

                {/* Expandable Details Panel */}
                {isExpanded && (
                  <div className="pt-4 border-t border-black/5 dark:border-[#2D2D25] space-y-4 animate-fade-in text-xs">
                    
                    {/* Prediction text */}
                    <div className={`p-3.5 rounded-2xl border font-medium leading-relaxed ${
                      calc.isSafe 
                        ? isDark ? 'bg-[#829653]/10 border-[#829653]/25' : 'bg-[#606C38]/5 border-[#606C38]/15' 
                        : isDark ? 'bg-[#D18E4E]/10 border-[#D18E4E]/25' : 'bg-[#BC6C25]/5 border-[#BC6C25]/15'
                    }`}>
                      {calc.isSafe ? (
                        <p className={isDark ? 'text-[#829653]' : 'text-[#606C38]'}>
                          🎉 Current pace is solid! You can safely skip the next <strong>{calc.safeSkipCount}</strong> classes of this course.
                        </p>
                      ) : (
                        <p className={isDark ? 'text-[#D18E4E]' : 'text-[#BC6C25]'}>
                          ⚠️ Deficit alert! You must attend the next <strong>{calc.classesNeededCount === Infinity ? 'indefinite perfect' : calc.classesNeededCount}</strong> classes consecutively to reach your goal.
                        </p>
                      )}
                    </div>

                    {/* Quick +1 Loggers vs Manual Edit form */}
                    {!isEditingManual ? (
                      <div className="space-y-2.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider opacity-55 block">Log attendance for today</span>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => handleQuickIncrement(course.id, 'attended')}
                            className={`py-2.5 px-3 font-bold rounded-2xl transition-all cursor-pointer text-center text-xs ${
                              isDark 
                                ? 'bg-[#829653] text-[#1C1C16] hover:opacity-90' 
                                : 'bg-[#606C38] text-white hover:opacity-95'
                            }`}
                          >
                            + Attended Class
                          </button>
                          <button
                            onClick={() => handleQuickIncrement(course.id, 'skipped')}
                            className={`py-2.5 px-3 font-bold rounded-2xl transition-all cursor-pointer text-center text-xs ${
                              isDark 
                                ? 'bg-[#D18E4E] text-[#1C1C16] hover:opacity-90' 
                                : 'bg-[#BC6C25] text-white hover:opacity-95'
                            }`}
                          >
                            + Skipped Class
                          </button>
                        </div>
                        <button
                          onClick={() => setIsEditingManual(true)}
                          className={`w-full py-2.5 border rounded-2xl transition-colors font-bold text-center text-xs cursor-pointer ${
                            isDark 
                              ? 'border-[#2D2D25] hover:bg-[#1C1C16] text-[#D1D1C6]' 
                              : 'border-black/5 hover:bg-[#F5F5F0] text-[#5A5A40]'
                          }`}
                        >
                          ✏️ Manual Edit (Type Counts)
                        </button>
                      </div>
                    ) : (
                      <div className={`space-y-4 p-4 rounded-2xl border ${
                        isDark ? 'bg-[#1C1C16] border-[#2D2D25]' : 'bg-[#F5F5F0] border-black/5'
                      }`}>
                        <div className="flex items-center justify-between border-b border-black/[0.04] dark:border-white/[0.04] pb-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider opacity-75">Edit Course & Attendance Details</span>
                          <span className="text-[9px] opacity-55">Changes apply instantly</span>
                        </div>

                        <div className="space-y-3">
                          {/* Course Name Input */}
                          <div>
                            <label className="text-[10px] opacity-75 mb-1 block font-bold">Subject / Course Name</label>
                            <input
                              type="text"
                              value={manualName}
                              onChange={(e) => setManualName(e.target.value)}
                              placeholder="e.g. Modern Physics"
                              className={`w-full py-2 px-3 border rounded-xl outline-none text-xs font-serif ${
                                isDark ? 'bg-[#25251F] border-[#2D2D25]' : 'bg-white border-black/5'
                              }`}
                            />
                          </div>

                          {/* Professor / Instructor Name */}
                          <div>
                            <label className="text-[10px] opacity-75 mb-1 block font-bold">Professor Name</label>
                            <input
                              type="text"
                              value={manualProfessor}
                              onChange={(e) => setManualProfessor(e.target.value)}
                              placeholder="e.g. Dr. Richard Feynman"
                              className={`w-full py-2 px-3 border rounded-xl outline-none text-xs ${
                                isDark ? 'bg-[#25251F] border-[#2D2D25]' : 'bg-white border-black/5'
                              }`}
                            />
                          </div>

                          {/* Row 1: Credits and Required Percent */}
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-[10px] opacity-75 mb-1 block font-bold">Credits</label>
                              <input
                                type="number"
                                min="1"
                                max="10"
                                step="0.5"
                                value={manualCredits}
                                onChange={(e) => setManualCredits(Number(e.target.value) || 3)}
                                className={`w-full py-2 px-3 border rounded-xl outline-none text-xs ${
                                  isDark ? 'bg-[#25251F] border-[#2D2D25]' : 'bg-white border-black/5'
                                }`}
                              />
                            </div>
                            <div>
                              <label className="text-[10px] opacity-75 mb-1 block font-bold">Required %</label>
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={manualRequiredPercent}
                                onChange={(e) => setManualRequiredPercent(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                                className={`w-full py-2 px-3 border rounded-xl outline-none text-xs ${
                                  isDark ? 'bg-[#25251F] border-[#2D2D25]' : 'bg-white border-black/5'
                                }`}
                              />
                            </div>
                          </div>

                          {/* Row 2: Held and Attended classes */}
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-[10px] opacity-75 mb-1 block font-bold">Classes Held</label>
                              <input
                                type="number"
                                min="0"
                                value={manualHeld}
                                onChange={(e) => setManualHeld(Math.max(0, parseInt(e.target.value) || 0))}
                                className={`w-full py-2 px-3 border rounded-xl outline-none text-xs ${
                                  isDark ? 'bg-[#25251F] border-[#2D2D25]' : 'bg-white border-black/5'
                                }`}
                              />
                            </div>
                            <div>
                              <label className="text-[10px] opacity-75 mb-1 block font-bold">Classes Attended</label>
                              <input
                                type="number"
                                min="0"
                                value={manualAttended}
                                onChange={(e) => setManualAttended(Math.max(0, parseInt(e.target.value) || 0))}
                                className={`w-full py-2 px-3 border rounded-xl outline-none text-xs ${
                                  isDark ? 'bg-[#25251F] border-[#2D2D25]' : 'bg-white border-black/5'
                                }`}
                              />
                            </div>
                          </div>
                        </div>

                        {manualError && (
                          <p className="text-rose-600 text-[10px] font-semibold">{manualError}</p>
                        )}

                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <button
                            onClick={() => handleSaveManual(course.id)}
                            className={`py-2 text-xs font-bold rounded-xl cursor-pointer flex items-center justify-center gap-1.5 ${
                              isDark ? 'bg-[#8C8C70] text-[#1C1C16]' : 'bg-[#5A5A40] text-white'
                            }`}
                          >
                            <Save size={12} />
                            <span>Save Changes</span>
                          </button>
                          <button
                            onClick={() => {
                              setIsEditingManual(false);
                              setManualError('');
                            }}
                            className={`py-2 text-xs font-bold rounded-xl border cursor-pointer ${
                              isDark ? 'border-[#2D2D25] hover:bg-[#25251F]' : 'border-black/5 hover:bg-white'
                            }`}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Permanent Delete Button */}
                    <div className="flex justify-end pt-2">
                      <button
                        onClick={() => onDeleteCourse(course.id)}
                        className="text-rose-600 hover:opacity-80 font-bold flex items-center gap-1 cursor-pointer py-1 px-2 rounded-lg"
                        title="Delete Course permanently"
                      >
                        <Trash2 size={13} />
                        <span>Delete Subject</span>
                      </button>
                    </div>

                  </div>
                )}
              </div>

              {/* View Details Expand button */}
              <button
                onClick={() => handleToggleDetails(course.id)}
                className={`w-full py-3.5 border-t text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  isDark 
                    ? 'border-[#2D2D25] bg-[#1C1C16]/50 text-[#D4A373] hover:bg-[#1C1C16]' 
                    : 'border-black/5 bg-[#F5F5F0]/50 text-[#5A5A40] hover:bg-[#F5F5F0]'
                }`}
              >
                <span>{isExpanded ? 'Collapse Details' : 'View Details & Update'}</span>
                {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            </div>
          );
        })}
      </div>

      {/* ================= ADD COURSE MODAL ================= */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`w-full max-w-md rounded-[32px] border flex flex-col transition-all overflow-hidden ${
            isDark 
              ? 'bg-[#25251F] border-[#2D2D25] text-[#D1D1C6] shadow-lg' 
              : 'bg-white border-black/5 text-[#2D2D2D] shadow-sm'
          }`}>
            <div className="flex items-center justify-between p-5 border-b border-black/5 dark:border-[#2D2D25]">
              <div className="flex items-center gap-2">
                <Book size={20} className={isDark ? 'text-[#D4A373]' : 'text-[#5A5A40]'} />
                <h3 className="font-serif italic text-lg">Add New Subject</h3>
              </div>
              <button 
                onClick={() => setIsAddOpen(false)}
                className="p-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-[#1C1C16] cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateCourse} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 opacity-75">Subject Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Advanced Calculus"
                  value={newCourseName}
                  onChange={(e) => setNewCourseName(e.target.value)}
                  className={`w-full py-2.5 px-3 rounded-2xl border text-sm outline-none transition-all ${
                    isDark 
                      ? 'bg-[#1C1C16] border-[#2D2D25] text-white focus:border-[#8C8C70]' 
                      : 'bg-[#F5F5F0] border-black/5 text-[#2D2D2D] focus:bg-white focus:border-[#5A5A40]'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 opacity-75">Professor / Lecturer</label>
                <input
                  type="text"
                  placeholder="e.g. Prof. Alan Turing"
                  value={newProfessor}
                  onChange={(e) => setNewProfessor(e.target.value)}
                  className={`w-full py-2.5 px-3 rounded-2xl border text-sm outline-none transition-all ${
                    isDark 
                      ? 'bg-[#1C1C16] border-[#2D2D25] text-white focus:border-[#8C8C70]' 
                      : 'bg-[#F5F5F0] border-black/5 text-[#2D2D2D] focus:bg-white focus:border-[#5A5A40]'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 opacity-75">Credits</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="10"
                    value={newCredits}
                    onChange={(e) => setNewCredits(Math.max(0, Number(e.target.value) || 3.0))}
                    className={`w-full py-2.5 px-3 rounded-2xl border text-sm outline-none transition-all ${
                      isDark 
                        ? 'bg-[#1C1C16] border-[#2D2D25] text-white focus:border-[#8C8C70]' 
                        : 'bg-[#F5F5F0] border-black/5 text-[#2D2D2D] focus:bg-white focus:border-[#5A5A40]'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 opacity-75">Goal Requirement %</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={newRequiredPercent}
                    onChange={(e) => setNewRequiredPercent(Math.min(100, Math.max(0, parseInt(e.target.value) || 75)))}
                    className={`w-full py-2.5 px-3 rounded-2xl border text-sm outline-none transition-all ${
                      isDark 
                        ? 'bg-[#1C1C16] border-[#2D2D25] text-white focus:border-[#8C8C70]' 
                        : 'bg-[#F5F5F0] border-black/5 text-[#2D2D2D] focus:bg-white focus:border-[#5A5A40]'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 opacity-75">Starting Held</label>
                  <input
                    type="number"
                    min="0"
                    value={newHeld}
                    onChange={(e) => setNewHeld(Math.max(0, parseInt(e.target.value) || 0))}
                    className={`w-full py-2.5 px-3 rounded-2xl border text-sm outline-none transition-all ${
                      isDark 
                        ? 'bg-[#1C1C16] border-[#2D2D25] text-white focus:border-[#8C8C70]' 
                        : 'bg-[#F5F5F0] border-black/5 text-[#2D2D2D] focus:bg-white focus:border-[#5A5A40]'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 opacity-75">Starting Attended</label>
                  <input
                    type="number"
                    min="0"
                    value={newAttended}
                    onChange={(e) => setNewAttended(Math.max(0, parseInt(e.target.value) || 0))}
                    className={`w-full py-2.5 px-3 rounded-2xl border text-sm outline-none transition-all ${
                      isDark 
                        ? 'bg-[#1C1C16] border-[#2D2D25] text-white focus:border-[#8C8C70]' 
                        : 'bg-[#F5F5F0] border-black/5 text-[#2D2D2D] focus:bg-white focus:border-[#5A5A40]'
                    }`}
                  />
                </div>
              </div>

              {addError && (
                <p className="text-rose-600 text-xs font-semibold">{addError}</p>
              )}

              <div className="flex gap-2 pt-4 border-t border-black/5 dark:border-[#2D2D25]">
                <button
                  type="submit"
                  id="submit-add-course"
                  className={`flex-1 py-3 text-sm font-bold rounded-2xl cursor-pointer ${
                    isDark 
                      ? 'bg-[#8C8C70] text-[#1C1C16]' 
                      : 'bg-[#5A5A40] text-white'
                  }`}
                >
                  Create Subject
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className={`py-3 px-4 text-sm font-bold border rounded-2xl cursor-pointer ${
                    isDark 
                      ? 'border-[#2D2D25] hover:bg-[#1C1C16]' 
                      : 'border-black/5 hover:bg-[#F5F5F0]'
                  }`}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
