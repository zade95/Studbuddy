import { Course, ScheduleSlot, DayOfWeek, AttendanceCalculation } from '../types';

/**
 * Calculates attendance statistics for a given course.
 */
export function calculateAttendance(held: number, attended: number, requiredPercent: number): AttendanceCalculation {
  if (held <= 0) {
    return {
      currentPercent: 100,
      isSafe: true,
      safeSkipCount: 0,
      classesNeededCount: 0,
    };
  }

  const currentPercent = (attended / held) * 100;
  const reqDecimal = requiredPercent / 100;

  if (currentPercent >= requiredPercent) {
    // Current attendance meets or exceeds requirements
    // Formula for maximum additional classes that can be skipped:
    // floor(attended / (requiredPercent/100) - held)
    let safeSkipCount = 0;
    if (requiredPercent > 0) {
      safeSkipCount = Math.floor(attended / reqDecimal - held);
    } else {
      safeSkipCount = 999; // unlimited skips for 0% requirement
    }

    return {
      currentPercent,
      isSafe: true,
      safeSkipCount: Math.max(0, safeSkipCount),
      classesNeededCount: 0,
    };
  } else {
    // Current attendance is below requirements
    // Formula for consecutive classes that must be attended:
    // ceil((requiredPercent/100 * held - attended) / (1 - requiredPercent/100))
    let classesNeededCount = 0;
    if (requiredPercent === 100) {
      classesNeededCount = Infinity; // Needs perfect attendance forever
    } else {
      classesNeededCount = Math.ceil((reqDecimal * held - attended) / (1 - reqDecimal));
    }

    return {
      currentPercent,
      isSafe: false,
      safeSkipCount: 0,
      classesNeededCount: Math.max(0, classesNeededCount),
    };
  }
}

// Default courses based on the PRD and Mockup
export const DEFAULT_COURSES: Course[] = [
  {
    id: 'course-calc',
    name: 'Advanced Calculus',
    professor: 'Prof. Alan Turing',
    credits: 4.0,
    held: 25,
    attended: 18, // 18/25 = 72% (below 75% required)
    required_percent: 75,
    color: 'amber', // Warning status (Amber)
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'course-ds',
    name: 'Data Structures',
    professor: 'Prof. Grace Hopper',
    credits: 3.0,
    held: 40,
    attended: 38, // 38/40 = 95% (above 75% required)
    required_percent: 75,
    color: 'emerald', // Safe status (Green)
    createdAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'course-physics',
    name: 'Modern Physics',
    professor: 'Prof. Marie Curie',
    credits: 4.0,
    held: 33,
    attended: 29, // 29/33 = 87.8% (above 75% required)
    required_percent: 75,
    color: 'emerald', // Safe status (Green)
    createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'course-econ',
    name: 'Microeconomics',
    professor: 'Prof. Adam Smith',
    credits: 3.0,
    held: 18,
    attended: 11, // 11/18 = 61.1% (below 75% required - Critical Red)
    required_percent: 75,
    color: 'rose', // Critical status (Red)
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
  }
];

// Default schedule based on wireframes
export const DEFAULT_SCHEDULE: ScheduleSlot[] = [
  {
    id: 'slot-1',
    courseId: 'course-ds',
    courseName: 'Data Structures',
    day: 'Monday',
    startTime: '09:00',
    endTime: '10:30',
    room: 'Sci Bldg 204',
    type: 'Lecture',
    color: 'indigo'
  },
  {
    id: 'slot-2',
    courseId: 'course-calc',
    courseName: 'Advanced Calculus',
    day: 'Tuesday',
    startTime: '10:00',
    endTime: '12:00',
    room: 'Main Hall 101',
    type: 'Lecture',
    color: 'amber'
  },
  {
    id: 'slot-3',
    courseId: 'course-physics',
    courseName: 'Modern Physics',
    day: 'Tuesday',
    startTime: '14:00',
    endTime: '15:30',
    room: 'Lab Center B',
    type: 'Lecture',
    color: 'emerald'
  },
  {
    id: 'slot-4',
    courseId: 'course-ds',
    courseName: 'Data Structures',
    day: 'Wednesday',
    startTime: '09:00',
    endTime: '10:30',
    room: 'Sci Bldg 204',
    type: 'Lecture',
    color: 'indigo'
  },
  {
    id: 'slot-5',
    courseId: 'course-econ',
    courseName: 'Microeconomics',
    day: 'Thursday',
    startTime: '11:00',
    endTime: '12:30',
    room: 'Business Sch 402',
    type: 'Lecture',
    color: 'rose'
  },
  {
    id: 'slot-6',
    courseId: 'course-physics',
    courseName: 'Modern Physics',
    day: 'Friday',
    startTime: '10:00',
    endTime: '11:30',
    room: 'Lab Center B',
    type: 'Lab',
    color: 'emerald'
  }
];
