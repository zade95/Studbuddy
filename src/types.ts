export interface Course {
  id: string;
  name: string;
  professor: string;
  credits: number;
  held: number;
  attended: number;
  required_percent: number;
  color: string; // Tailwind color name like 'indigo', 'amber', 'emerald', 'rose'
  createdAt: string;
}

export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';

export interface ScheduleSlot {
  id: string;
  courseId: string;
  courseName: string;
  day: DayOfWeek;
  startTime: string; // "09:00"
  endTime: string;   // "10:30"
  room: string;
  type: 'Lecture' | 'Lab' | 'Seminar';
  color: string;
}

export interface AttendanceLog {
  id: string;
  courseId: string;
  timestamp: string;
  status: 'attended' | 'skipped';
  previousHeld: number;
  previousAttended: number;
}

export interface UserSession {
  email: string;
  name?: string;
  uid?: string;
  photoURL?: string;
  joinedAt: string;
  isSandbox?: boolean;
}

export interface AttendanceCalculation {
  currentPercent: number;
  isSafe: boolean;
  safeSkipCount: number;
  classesNeededCount: number;
}
