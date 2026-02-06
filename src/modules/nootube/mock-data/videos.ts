import type { UserEntity } from '@/modules/users/api/user.types'
import type { NooTubeVideoEntity } from '../api/nootube.types'

const mockUsers: Record<string, UserEntity> = {
  user1: {
    _entityName: 'User',
    id: 'user1',
    createdAt: new Date('2025-01-01T08:00:00Z'),
    updatedAt: null,
    username: 'alice',
    email: 'alice@example.com',
    name: 'Alice Smith',
    telegramId: null,
    telegramUsername: null,
    role: 'teacher',
    isBlocked: false,
    isVerified: true
  },
  user2: {
    _entityName: 'User',
    id: 'user2',
    createdAt: new Date('2025-01-02T08:00:00Z'),
    updatedAt: null,
    username: 'bob',
    email: 'bob@example.com',
    name: 'Bob Johnson',
    telegramId: null,
    telegramUsername: null,
    role: 'assistant',
    isBlocked: false,
    isVerified: true
  },
  user3: {
    _entityName: 'User',
    id: 'user3',
    createdAt: new Date('2025-01-03T08:00:00Z'),
    updatedAt: null,
    username: 'carol',
    email: 'carol@example.com',
    name: 'Carol Davis',
    telegramId: null,
    telegramUsername: null,
    role: 'mentor',
    isBlocked: false,
    isVerified: true
  },
  user4: {
    _entityName: 'User',
    id: 'user4',
    createdAt: new Date('2025-01-04T08:00:00Z'),
    updatedAt: null,
    username: 'dan',
    email: 'dan@example.com',
    name: 'Dan Wilson',
    telegramId: null,
    telegramUsername: null,
    role: 'admin',
    isBlocked: false,
    isVerified: true
  },
  user5: {
    _entityName: 'User',
    id: 'user5',
    createdAt: new Date('2025-01-05T08:00:00Z'),
    updatedAt: null,
    username: 'eve',
    email: 'eve@example.com',
    name: 'Eve Lewis',
    telegramId: null,
    telegramUsername: null,
    role: 'student',
    isBlocked: false,
    isVerified: true
  }
}

export const videos: NooTubeVideoEntity[] = [
  {
    _entityName: 'NooTubeVideo',
    id: 'vid1',
    createdAt: new Date('2025-06-01T10:00:00Z'),
    updatedAt: null,
    title: 'Introduction to Quantum Mechanics',
    description: 'An overview of the basic concepts of quantum theory.',
    thumbnailId: null,
    externalIdentifier: 'abc123',
    externalUrl: 'https://youtube.com/watch?v=abc123',
    externalThumbnailUrl: 'https://img.youtube.com/vi/abc123/0.jpg',
    serviceType: 'you-tube',
    state: 'published',
    duration: 1200,
    publishedAt: new Date('2025-06-01T10:00:00Z'),
    uploadedByUserId: 'user1',
    uploadedByUser: mockUsers.user1
  },
  {
    _entityName: 'NooTubeVideo',
    id: 'vid2',
    createdAt: new Date('2025-06-02T09:30:00Z'),
    updatedAt: null,
    title: 'Teaching Strategies for Online Learning',
    description: null,
    thumbnailId: null,
    externalIdentifier: 'def456',
    externalUrl: 'https://vk.com/video-123_456',
    externalThumbnailUrl: null,
    serviceType: 'vk-video',
    state: 'uploaded',
    duration: 900,
    publishedAt: new Date('2025-06-02T09:30:00Z'),
    uploadedByUserId: 'user2',
    uploadedByUser: mockUsers.user2
  },
  {
    _entityName: 'NooTubeVideo',
    id: 'vid3',
    createdAt: new Date('2025-06-03T12:00:00Z'),
    updatedAt: null,
    title: 'Rutube Science Show',
    description: 'Weekly updates on science from Rutube.',
    thumbnailId: null,
    externalIdentifier: 'ghi789',
    externalUrl: 'https://rutube.ru/video/ghi789',
    externalThumbnailUrl: 'https://example.com/thumbnails/ghi789.jpg',
    serviceType: 'rutube',
    state: 'published',
    duration: 1800,
    publishedAt: new Date('2025-06-03T12:00:00Z'),
    uploadedByUserId: 'user3',
    uploadedByUser: mockUsers.user3
  }
]
