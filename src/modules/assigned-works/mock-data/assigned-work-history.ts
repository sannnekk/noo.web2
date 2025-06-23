import type { AssignedWorkStatusHistoryEntity } from "../api/assigned-work.types";

export const assignedWorkHistory: AssignedWorkStatusHistoryEntity[] = [
  {
    id: 'history-1',
    assignedWorkId: '1',
    status: 'created',
    value: {
      courseId: 'course-1',
      courseTitle: 'Course 1',
      materialId: 'material-1',
      materialTitle: 'Material 1',
    },
    createdAt: new Date('2025-06-23T10:00:00Z'),
    updatedAt: null,
    changedById: 'user-1',
    changedBy: {
      id: 'user-1',
      name: 'User One',
      email: 'user.one@example.com',
      role: 'student',
      createdAt: new Date('2022-01-01T10:00:00Z'),
      updatedAt: new Date('2022-01-01T10:00:00Z'),
      username: 'user.one',
      telegramId: null,
      telegramUsername: null,
      isBlocked: false,
      isVerified: true,
    }
  },
  {
    id: 'history-2',
    assignedWorkId: '1',
    status: 'started-solving',
    value: null,
    createdAt: new Date('2025-06-12T10:00:00Z'),
    updatedAt: null,
    changedById: 'user-2',
    changedBy: {
      id: 'user-1',
      name: 'User One',
      email: 'user.one@example.com',
      role: 'student',
      createdAt: new Date('2022-01-01T10:00:00Z'),
      updatedAt: new Date('2022-01-01T10:00:00Z'),
      username: 'user.one',
      telegramId: null,
      telegramUsername: null,
      isBlocked: false,
      isVerified: true,
    }
  },
  {
    id: 'history-3',
    assignedWorkId: '1',
    status: 'solve-deadline-shifted',
    value: {
      courseId: 'course-1',
      courseTitle: 'Course 1',
      materialId: 'material-1',
      materialTitle: 'Material 1',
    },
    createdAt: new Date('2023-01-02T10:00:00Z'),
    updatedAt: new Date('2023-01-02T10:00:00Z'),
    changedById: 'user-2',
    changedBy: {
      id: 'user-1',
      name: 'User One',
      email: 'user.one@example.com',
      role: 'student',
      createdAt: new Date('2022-01-01T10:00:00Z'),
      updatedAt: new Date('2022-01-01T10:00:00Z'),
      username: 'user.one',
      telegramId: null,
      telegramUsername: null,
      isBlocked: false,
      isVerified: true,
    }
  }
]
