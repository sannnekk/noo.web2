import type { PollEntity } from '../api/poll.types'

const polls: PollEntity[] = [
  {
    _entityName: 'Poll',
    id: 'poll-1',
    title: 'Favorite Front‑End Framework',
    description: 'Choose your preferred JS framework/library.',
    isActive: true,
    createdAt: new Date('2025-06-01T09:00:00Z'),
    updatedAt: new Date('2025-06-02T10:15:00Z')
  },
  {
    _entityName: 'Poll',
    id: 'poll-2',
    title: 'Weekly Team Lunch Spot',
    description: 'Vote for where we should go this Friday.',
    isActive: false,
    createdAt: new Date('2025-06-02T11:30:00Z'),
    updatedAt: new Date('2025-06-03T08:45:00Z')
  },
  {
    _entityName: 'Poll',
    id: 'poll-3',
    title: 'Next Hackathon Theme',
    description: 'Select the theme for our July hackathon.',
    isActive: true,
    createdAt: new Date('2025-06-03T14:20:00Z'),
    updatedAt: null
  },
  {
    _entityName: 'Poll',
    id: 'poll-4',
    title: 'Some poll',
    description: 'Anonymous feedback: How can we improve sprint planning?',
    isActive: true,
    createdAt: new Date('2025-06-04T10:00:00Z'),
    updatedAt: null
  },
  {
    _entityName: 'Poll',
    id: 'poll-5',
    title: 'Company Retreat Location',
    description: null,
    isActive: false,
    createdAt: new Date('2025-06-05T12:00:00Z'),
    updatedAt: new Date('2025-06-06T13:00:00Z')
  },
  {
    _entityName: 'Poll',
    id: 'poll-6',
    title: 'Preferred IDE',
    description: 'VSCode, WebStorm, Vim, or other?',
    isActive: true,
    createdAt: new Date('2025-06-06T09:45:00Z'),
    updatedAt: null
  },
  {
    _entityName: 'Poll',
    id: 'poll-7',
    title: 'Office Snack Choices',
    description: 'Vote on what snacks to stock next month.',
    isActive: false,
    createdAt: new Date('2025-06-07T15:10:00Z'),
    updatedAt: new Date('2025-06-08T16:25:00Z')
  },
  {
    _entityName: 'Poll',
    id: 'poll-8',
    title: 'Team Building Activity',
    description: 'Prefer virtual game night or in‑person outing?',
    isActive: true,
    createdAt: new Date('2025-06-08T08:30:00Z'),
    updatedAt: null
  },
  {
    _entityName: 'Poll',
    id: 'poll-9',
    title: 'Learning Workshop Topic',
    description: 'Which new technology should we cover in July?',
    isActive: false,
    createdAt: new Date('2025-06-09T13:55:00Z'),
    updatedAt: new Date('2025-06-10T09:15:00Z')
  },
  {
    _entityName: 'Poll',
    id: 'poll-10',
    title: 'Quarterly All‑Hands Agenda',
    description: null,
    isActive: true,
    createdAt: new Date('2025-06-10T10:10:00Z'),
    updatedAt: null
  }
]

export { polls }
