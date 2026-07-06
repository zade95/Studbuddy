import React, { useState } from 'react';
import { Calendar, Clock, MapPin, ChevronLeft, ChevronRight, Check, AlertTriangle, BookOpen, Plus, Trash2, Save, X } from 'lucide-react';
import { Course, ScheduleSlot, DayOfWeek } from '../types';

interface ScheduleViewProps {
  courses: Course[];
  schedule: ScheduleSlot[];
  onUpdateSchedule: (newSchedule: ScheduleSlot[]) => void;
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

export default function ScheduleView({
  courses,
  schedule,
  onUpdateSchedule,
  onUpdateCourse,
  isDark,
}: ScheduleViewProps) {
  // 1. Completion Tracker (Interactive Agenda Logging)
  const [completedSlots, setCompletedSlots] = useState<Record<string, 'present' | 'skipped'>>({
    'slot-2': 'present', // Calculus marked complete by default
  });

  // 2. Modal States for Creating/Editing Slots
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlotId, setEditingSlotId] = useState<string | null>(null); // null means "Add Slot"
  
  const [slotCourseId, setSlotCourseId] = useState('');
  const [slotDay, setSlotDay] = useState<DayOfWeek>('Monday');
  const [slotStartTime, setSlotStartTime] = useState('09:00');
  const [slotEndTime, setSlotEndTime] = useState('10:30');
  const [slotRoom, setSlotRoom] = useState('');
  const [slotType, setSlotType] = useState('Lecture');
  const [modalError, setModalError] = useState('');

  const handleMarkAgenda = (slotId: string, courseId: string, status: 'present' | 'skipped') => {
    setCompletedSlots(prev => ({
      ...prev,
      [slotId]: status,
    }));

    const course = courses.find(c => c.id === courseId);
    if (!course) return;

    const newH = course.held + 1;
    let newA = course.attended;
    if (status === 'present') {
      newA += 1;
    }

    onUpdateCourse(courseId, newH, newA);
  };

  const getCourseColor = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    if (!course) return 'indigo';
    return course.color;
  };

  const getDayColumn = (day: DayOfWeek): number => {
    switch (day) {
      case 'Monday': return 2;
      case 'Tuesday': return 3;
      case 'Wednesday': return 4;
      case 'Thursday': return 5;
      case 'Friday': return 6;
      default: return 2;
    }
  };

  const getSlotPosition = (slot: ScheduleSlot) => {
    const [startHourStr, startMinStr] = slot.startTime.split(':');
    const [endHourStr, endMinStr] = slot.endTime.split(':');

    const startHour = Number(startHourStr) || 8;
    const startMin = Number(startMinStr) || 0;
    const endHour = Number(endHourStr) || 9;
    const endMin = Number(endMinStr) || 0;

    const startDecimal = startHour + startMin / 60;
    const endDecimal = endHour + endMin / 60;
    const duration = Math.max(0.5, endDecimal - startDecimal);

    const top = (startDecimal - 8) * 80 + 40; // 40px is header height, 80px is hour height
    const height = duration * 80;

    return {
      gridColumn: getDayColumn(slot.day),
      top: `${top}px`,
      height: `${height}px`,
      left: '4px',
      right: '4px',
    };
  };

  // 3. Open Modal for Adding a Slot
  const handleOpenAddModal = () => {
    setEditingSlotId(null);
    setSlotCourseId(courses[0]?.id || '');
    setSlotDay('Monday');
    setSlotStartTime('09:00');
    setSlotEndTime('10:30');
    setSlotRoom('');
    setSlotType('Lecture');
    setModalError('');
    setIsModalOpen(true);
  };

  // 4. Open Modal for Editing a Slot
  const handleOpenEditModal = (slot: ScheduleSlot) => {
    setEditingSlotId(slot.id);
    setSlotCourseId(slot.courseId || '');
    setSlotDay(slot.day);
    setSlotStartTime(slot.startTime);
    setSlotEndTime(slot.endTime);
    setSlotRoom(slot.room);
    setSlotType(slot.type);
    setModalError('');
    setIsModalOpen(true);
  };

  // 5. Save Added/Edited Slot
  const handleSaveSlot = () => {
    if (!slotCourseId) {
      setModalError('Please select a course for this schedule slot');
      return;
    }
    if (!slotStartTime || !slotEndTime) {
      setModalError('Please enter start and end times');
      return;
    }

    const startMinutes = Number(slotStartTime.split(':')[0]) * 60 + Number(slotStartTime.split(':')[1]);
    const endMinutes = Number(slotEndTime.split(':')[0]) * 60 + Number(slotEndTime.split(':')[1]);

    if (endMinutes <= startMinutes) {
      setModalError('End time must be after the start time');
      return;
    }

    const selectedCourse = courses.find(c => c.id === slotCourseId);
    const courseName = selectedCourse ? selectedCourse.name : 'Unknown Course';
    const courseColor = selectedCourse ? selectedCourse.color : 'indigo';

    if (editingSlotId === null) {
      // Adding new slot
      const newSlot: ScheduleSlot = {
        id: 'slot-' + Date.now(),
        courseId: slotCourseId,
        courseName,
        day: slotDay,
        startTime: slotStartTime,
        endTime: slotEndTime,
        room: slotRoom.trim() || 'TBA',
        type: slotType,
        color: courseColor,
      };
      onUpdateSchedule([...schedule, newSlot]);
    } else {
      // Editing existing slot
      const updated = schedule.map(s => {
        if (s.id === editingSlotId) {
          return {
            ...s,
            courseId: slotCourseId,
            courseName,
            day: slotDay,
            startTime: slotStartTime,
            endTime: slotEndTime,
            room: slotRoom.trim() || 'TBA',
            type: slotType,
            color: courseColor,
          };
        }
        return s;
      });
      onUpdateSchedule(updated);
    }

    setIsModalOpen(false);
  };

  // 6. Delete Slot
  const handleDeleteSlot = (id: string) => {
    onUpdateSchedule(schedule.filter(s => s.id !== id));
    setIsModalOpen(false);
  };

  // Today is Tuesday in our layout context
  const todaySlots = schedule.filter(s => s.day === 'Tuesday').sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Toolbar / Header Area */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className={`font-serif italic tracking-tight text-3xl md:text-4xl ${isDark ? 'text-[#D4A373]' : 'text-[#5A5A40]'}`}>
            Weekly Schedule
          </h2>
          <p className="font-sans text-xs mt-1.5 uppercase tracking-wider opacity-60">
            Interactive Schedule Manager · Oct 14 - Oct 18, 2026
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenAddModal}
            className={`flex items-center gap-2 py-2 px-4 text-xs font-bold rounded-xl transition-all border cursor-pointer ${
              isDark
                ? 'bg-[#829653] border-none text-[#1C1C16] hover:opacity-90'
                : 'bg-[#606C38] border-none text-white hover:opacity-95'
            }`}
          >
            <Plus size={14} />
            <span>Add Class Slot</span>
          </button>

          <div className={`flex items-center gap-1 p-1 rounded-2xl border ${
            isDark ? 'bg-[#1C1C16] border-[#2D2D25]' : 'bg-[#F5F5F0] border-black/5'
          }`}>
            <button className="p-1.5 rounded-xl text-stone-400 hover:text-stone-600 dark:hover:text-white transition-colors cursor-pointer">
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs font-bold px-3">Today</span>
            <button className="p-1.5 rounded-xl text-stone-400 hover:text-stone-600 dark:hover:text-white transition-colors cursor-pointer">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid & Agenda */}
      <div className="flex flex-col lg:flex-row gap-6 max-w-7xl">
        
        {/* Calendar Grid (Left / Main) */}
        <div className={`flex-1 rounded-[32px] border p-5 overflow-x-auto ${
          isDark ? 'bg-[#25251F] border-[#2D2D25]' : 'bg-white border-black/5'
        }`}>
          <div className="min-w-[640px] relative">
            
            {/* Grid Container */}
            <div 
              className="grid" 
              style={{
                gridTemplateColumns: '60px repeat(5, 1fr)',
                gridTemplateRows: '40px repeat(10, 80px)', // Header + 10 hour rows (8am-5pm)
                backgroundColor: isDark ? '#2D2D25' : '#EAEAE0', // grid line colors
                gap: '1px',
                borderRadius: '24px',
                overflow: 'hidden',
                position: 'relative'
              }}
            >
              {/* Row 1: Headers */}
              <div className={isDark ? 'bg-[#25251F]' : 'bg-[#F5F5F0]'}></div>
              <div className={`flex items-center justify-center font-sans font-bold text-xs ${isDark ? 'bg-[#25251F]' : 'bg-white'}`}>Mon 14</div>
              <div className={`flex items-center justify-center font-serif italic text-xs font-bold rounded-t-lg ${
                isDark ? 'bg-[#1C1C16] text-[#D4A373]' : 'bg-[#F5F5F0] text-[#5A5A40]'
              }`}>Tue 15</div>
              <div className={`flex items-center justify-center font-sans font-bold text-xs ${isDark ? 'bg-[#25251F]' : 'bg-white'}`}>Wed 16</div>
              <div className={`flex items-center justify-center font-sans font-bold text-xs ${isDark ? 'bg-[#25251F]' : 'bg-white'}`}>Thu 17</div>
              <div className={`flex items-center justify-center font-sans font-bold text-xs ${isDark ? 'bg-[#25251F]' : 'bg-white'}`}>Fri 18</div>

              {/* Rows 2-11: Hours */}
              {Array.from({ length: 10 }).map((_, i) => {
                const hour = i + 8;
                const label = hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`;

                return (
                  <React.Fragment key={hour}>
                    <div className={`flex justify-end pr-3 pt-2 font-mono text-[10px] font-bold opacity-60 ${isDark ? 'bg-[#25251F]' : 'bg-[#F5F5F0]'}`}>
                      {label}
                    </div>
                    {Array.from({ length: 5 }).map((_, dIdx) => (
                      <div 
                        key={dIdx} 
                        className={`transition-colors border-r border-b ${
                          isDark 
                            ? 'bg-[#25251F] border-[#2D2D25]' 
                            : 'bg-white border-black/[0.03]'
                        } ${dIdx === 1 ? (isDark ? 'bg-[#1C1C16]/20' : 'bg-[#F5F5F0]/30') : ''}`}
                      />
                    ))}
                  </React.Fragment>
                );
              })}

              {/* ================= COURSE BLOCK OVERLAYS ================= */}
              {schedule.map((slot) => {
                const isCompleted = completedSlots[slot.id];
                const courseColor = getCourseColor(slot.courseId);

                let cardStyle = '';
                if (isDark) {
                  cardStyle = 'bg-[#1C1C16] border-[#2D2D25] text-[#D1D1C6] hover:bg-[#2A2A20] cursor-pointer';
                  if (courseColor === 'rose') cardStyle = 'bg-[#D18E4E]/15 border-[#D18E4E]/30 text-[#D18E4E] hover:bg-[#D18E4E]/25 cursor-pointer';
                  else if (courseColor === 'amber') cardStyle = 'bg-[#DDA15E]/15 border-[#DDA15E]/30 text-[#DDA15E] hover:bg-[#DDA15E]/25 cursor-pointer';
                  else if (courseColor === 'emerald') cardStyle = 'bg-[#829653]/15 border-[#829653]/30 text-[#829653] hover:bg-[#829653]/25 cursor-pointer';
                  else if (courseColor === 'indigo') cardStyle = 'bg-[#8C8C70]/15 border-[#8C8C70]/30 text-[#8C8C70] hover:bg-[#8C8C70]/25 cursor-pointer';
                } else {
                  cardStyle = 'bg-[#F5F5F0] border-black/5 text-[#2D2D2D] hover:bg-black/[0.02] cursor-pointer';
                  if (courseColor === 'rose') cardStyle = 'bg-[#BC6C25]/10 border-[#BC6C25]/25 text-[#BC6C25] hover:bg-[#BC6C25]/15 cursor-pointer';
                  else if (courseColor === 'amber') cardStyle = 'bg-[#DDA15E]/10 border-[#DDA15E]/25 text-[#DDA15E] hover:bg-[#DDA15E]/15 cursor-pointer';
                  else if (courseColor === 'emerald') cardStyle = 'bg-[#606C38]/10 border-[#606C38]/25 text-[#606C38] hover:bg-[#606C38]/15 cursor-pointer';
                  else if (courseColor === 'indigo') cardStyle = 'bg-[#5A5A40]/10 border-[#5A5A40]/25 text-[#5A5A40] hover:bg-[#5A5A40]/15 cursor-pointer';
                }

                return (
                  <div
                    key={slot.id}
                    className={`absolute rounded-2xl border p-2.5 flex flex-col justify-between overflow-hidden shadow-sm hover:scale-[1.01] transition-all duration-150 z-10 ${cardStyle} ${
                      isCompleted ? 'opacity-50' : ''
                    }`}
                    style={getSlotPosition(slot)}
                    onClick={() => handleOpenEditModal(slot)}
                    title="Click to edit or delete class slot"
                  >
                    <div>
                      <h4 className={`font-serif italic font-bold text-[11px] leading-tight truncate ${isCompleted ? 'line-through' : ''}`}>
                        {slot.courseName}
                      </h4>
                      <p className="text-[9px] opacity-75 mt-0.5 flex items-center gap-0.5">
                        <MapPin size={8} />
                        <span className="truncate">{slot.room}</span>
                      </p>
                    </div>
                    <div className="flex justify-between items-end">
                      <span className="text-[9px] font-mono opacity-70">
                        {slot.startTime} - {slot.endTime}
                      </span>
                      <span className="text-[8px] opacity-50 italic truncate">
                        {slot.type}
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* Current Time Indicator Line (Tue 1:30 PM) */}
              <div 
                className="absolute w-full border-t-2 border-[#BC6C25] z-20 pointer-events-none flex items-center" 
                style={{ top: '480px' }}
              >
                <div className="w-2.5 h-2.5 rounded-full bg-[#BC6C25] -ml-1.5 animate-ping absolute" />
                <div className="w-2 h-2 rounded-full bg-[#BC6C25] -ml-1" />
              </div>

            </div>
          </div>
        </div>

        {/* Sidebar: Today's Agenda (Right) */}
        <div className="w-full lg:w-80 flex flex-col gap-5 shrink-0">
          
          {/* Quick Stats / Today's Overview widget */}
          <div className={`rounded-[32px] p-5 border ${
            isDark ? 'bg-[#25251F] border-[#2D2D25]' : 'bg-white border-black/5'
          }`}>
            <h3 className="text-[10px] font-bold uppercase tracking-wider opacity-60 mb-3">Today's Overview</h3>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className={`p-4 rounded-2xl border ${isDark ? 'bg-[#1C1C16] border-[#2D2D25]' : 'bg-[#F5F5F0] border-black/5'}`}>
                <span className={`font-serif italic font-extrabold text-3xl block ${isDark ? 'text-[#D4A373]' : 'text-[#5A5A40]'}`}>
                  {todaySlots.length}
                </span>
                <span className="text-[10px] font-bold opacity-60 mt-1 block">Scheduled Classes</span>
              </div>
              <div className={`p-4 rounded-2xl border ${isDark ? 'bg-[#1C1C16] border-[#2D2D25]' : 'bg-[#F5F5F0] border-black/5'}`}>
                <span className={`font-serif italic font-extrabold text-3xl block ${isDark ? 'text-[#829653]' : 'text-[#606C38]'}`}>
                  {(todaySlots.length * 1.5).toFixed(1)}
                </span>
                <span className="text-[10px] font-bold opacity-60 mt-1 block">Class Hours</span>
              </div>
            </div>
          </div>

          {/* Agenda List */}
          <div className={`rounded-[32px] p-5 border flex-1 flex flex-col ${
            isDark ? 'bg-[#25251F] border-[#2D2D25]' : 'bg-white border-black/5'
          }`}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-serif italic text-base">Today's Agenda</h3>
              <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider ${
                isDark ? 'bg-[#1C1C16] text-[#D4A373]' : 'bg-[#F5F5F0] text-[#5A5A40]'
              }`}>
                Tue, Oct 15
              </span>
            </div>

            <div className="flex-1 flex flex-col gap-6 relative">
              <div className="absolute left-[11px] top-2 bottom-2 w-[2px] bg-black/5 dark:bg-[#1C1C16] rounded-full" />

              {todaySlots.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center opacity-60">
                  <span className="text-xl">☀️</span>
                  <p className="text-xs mt-2 italic font-serif">No classes scheduled for today.</p>
                </div>
              ) : (
                todaySlots.map((slot) => {
                  const isCompleted = completedSlots[slot.id];
                  return (
                    <div key={slot.id} className={`flex gap-4 relative ${isCompleted ? 'opacity-60' : ''}`}>
                      <div className={`w-6 h-6 rounded-full text-white flex items-center justify-center shrink-0 z-10 border-4 ${
                        isCompleted
                          ? isDark ? 'bg-[#829653] border-[#25251F]' : 'bg-[#606C38] border-white'
                          : isDark ? 'bg-[#8C8C70] border-[#25251F]' : 'bg-[#5A5A40] border-white'
                      }`}>
                        {isCompleted ? <Check size={10} /> : <div className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />}
                      </div>

                      <div className="flex-1">
                        <span className="text-[9px] font-mono opacity-60">{slot.startTime} - {slot.endTime}</span>
                        <div className={`p-3.5 rounded-2xl border mt-1.5 transition-all hover:border-[#8C8C70]/40 ${
                          isDark ? 'bg-[#1C1C16] border-[#2D2D25]' : 'bg-[#F5F5F0] border-black/5'
                        }`}>
                          <div className="flex justify-between items-start">
                            <h4 className={`font-serif italic font-bold text-xs ${isCompleted ? 'line-through opacity-75' : ''}`}>
                              {slot.courseName}
                            </h4>
                            <span className="text-[8px] uppercase tracking-wider px-1 rounded bg-black/5 dark:bg-white/5 opacity-70">
                              {slot.type}
                            </span>
                          </div>
                          <p className="text-[10px] opacity-60 mt-1 flex items-center gap-1">
                            <MapPin size={10} />
                            <span>{slot.room}</span>
                          </p>

                          {!isCompleted ? (
                            <div className="mt-3 flex gap-2 pt-1">
                              <button
                                onClick={() => handleMarkAgenda(slot.id, slot.courseId, 'present')}
                                className={`flex-1 py-1 px-2 font-bold text-[9px] rounded-lg transition-all cursor-pointer ${
                                  isDark ? 'bg-[#829653] text-[#1C1C16]' : 'bg-[#606C38] text-white'
                                }`}
                              >
                                Present
                              </button>
                              <button
                                onClick={() => handleMarkAgenda(slot.id, slot.courseId, 'skipped')}
                                className={`py-1 px-2.5 font-bold text-[9px] rounded-lg transition-all cursor-pointer border ${
                                  isDark ? 'border-[#2D2D25] hover:bg-[#25251F]' : 'border-black/5 hover:bg-white'
                                }`}
                              >
                                Skip
                              </button>
                            </div>
                          ) : (
                            <div className={`mt-2 text-[9px] font-bold ${
                              isCompleted === 'present'
                                ? isDark ? 'text-[#829653]' : 'text-[#606C38]'
                                : isDark ? 'text-[#D18E4E]' : 'text-[#BC6C25]'
                            }`}>
                              ✓ Logged: {isCompleted === 'present' ? 'Attended' : 'Skipped'}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

      </div>

      {/* ================= EDIT / CREATE SLOT MODAL ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className={`w-full max-w-md p-6 rounded-[28px] border shadow-2xl relative ${
            isDark ? 'bg-[#25251F] border-[#2D2D25] text-white' : 'bg-white border-black/5 text-[#2D2D2D]'
          }`}>
            
            {/* Close Button */}
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer opacity-70"
            >
              <X size={18} />
            </button>

            {/* Modal Title */}
            <div className="mb-5">
              <h3 className="font-serif italic text-lg font-bold">
                {editingSlotId === null ? 'Add Schedule Class' : 'Edit Class Slot'}
              </h3>
              <p className="text-[10px] opacity-60">Manage your class times on the visual grid.</p>
            </div>

            <div className="space-y-4">
              
              {/* Select Subject */}
              <div>
                <label className="text-[10px] font-bold uppercase opacity-75 mb-1 block">Course / Subject</label>
                <select
                  value={slotCourseId}
                  onChange={(e) => setSlotCourseId(e.target.value)}
                  className={`w-full py-2 px-3 border rounded-xl outline-none text-xs font-serif ${
                    isDark ? 'bg-[#1C1C16] border-[#2D2D25]' : 'bg-white border-black/10'
                  }`}
                >
                  <option value="">-- Select Subject --</option>
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Day of week */}
              <div>
                <label className="text-[10px] font-bold uppercase opacity-75 mb-1 block">Day of the Week</label>
                <select
                  value={slotDay}
                  onChange={(e) => setSlotDay(e.target.value as DayOfWeek)}
                  className={`w-full py-2 px-3 border rounded-xl outline-none text-xs ${
                    isDark ? 'bg-[#1C1C16] border-[#2D2D25]' : 'bg-white border-black/10'
                  }`}
                >
                  <option value="Monday">Monday</option>
                  <option value="Tuesday">Tuesday</option>
                  <option value="Wednesday">Wednesday</option>
                  <option value="Thursday">Thursday</option>
                  <option value="Friday">Friday</option>
                </select>
              </div>

              {/* Time Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase opacity-75 mb-1 block">Start Time</label>
                  <input
                    type="time"
                    value={slotStartTime}
                    onChange={(e) => setSlotStartTime(e.target.value)}
                    className={`w-full py-2 px-3 border rounded-xl outline-none text-xs ${
                      isDark ? 'bg-[#1C1C16] border-[#2D2D25]' : 'bg-white border-black/10'
                    }`}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase opacity-75 mb-1 block">End Time</label>
                  <input
                    type="time"
                    value={slotEndTime}
                    onChange={(e) => setSlotEndTime(e.target.value)}
                    className={`w-full py-2 px-3 border rounded-xl outline-none text-xs ${
                      isDark ? 'bg-[#1C1C16] border-[#2D2D25]' : 'bg-white border-black/10'
                    }`}
                  />
                </div>
              </div>

              {/* Room Location & Class Type */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase opacity-75 mb-1 block">Room Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Sci Bldg 104"
                    value={slotRoom}
                    onChange={(e) => setSlotRoom(e.target.value)}
                    className={`w-full py-2 px-3 border rounded-xl outline-none text-xs ${
                      isDark ? 'bg-[#1C1C16] border-[#2D2D25]' : 'bg-white border-black/10'
                    }`}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase opacity-75 mb-1 block">Class Type</label>
                  <select
                    value={slotType}
                    onChange={(e) => setSlotType(e.target.value)}
                    className={`w-full py-2 px-3 border rounded-xl outline-none text-xs ${
                      isDark ? 'bg-[#1C1C16] border-[#2D2D25]' : 'bg-white border-black/10'
                    }`}
                  >
                    <option value="Lecture">Lecture</option>
                    <option value="Lab">Lab</option>
                    <option value="Seminar">Seminar</option>
                    <option value="Tutorial">Tutorial</option>
                  </select>
                </div>
              </div>

              {modalError && (
                <p className="text-rose-600 text-xs font-semibold">{modalError}</p>
              )}

              {/* Modal Actions */}
              <div className="flex justify-between items-center pt-4 border-t border-black/[0.04] dark:border-white/[0.04]">
                <div>
                  {editingSlotId !== null && (
                    <button
                      onClick={() => handleDeleteSlot(editingSlotId)}
                      className="text-rose-600 hover:text-rose-500 font-bold text-xs flex items-center gap-1 cursor-pointer py-1.5 px-2 rounded-lg"
                      title="Remove from schedule"
                    >
                      <Trash2 size={13} />
                      <span>Delete</span>
                    </button>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className={`py-2 px-4 rounded-xl border font-bold text-xs cursor-pointer ${
                      isDark ? 'border-[#2D2D25] hover:bg-[#1C1C16]' : 'border-black/5 hover:bg-stone-50'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveSlot}
                    className={`py-2 px-4 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer ${
                      isDark ? 'bg-[#829653] text-[#1C1C16]' : 'bg-[#606C38] text-white'
                    }`}
                  >
                    <Save size={13} />
                    <span>Save Slot</span>
                  </button>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
