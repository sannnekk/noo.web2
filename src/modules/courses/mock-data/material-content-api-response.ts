import type { ApiResponse } from "@/core/api/api.utils";
import type { CourseMaterialContentEntity } from "../api/course.types";

export const materialContentResponse: ApiResponse<CourseMaterialContentEntity> = {
  data: {
    id: 'content-1',
    content: {
      $type: 'delta',
      ops: [
        { insert: 'This is a sample content for the course material.' },
        { insert: '\n' },
        { insert: 'It can include text, images, and other rich content.' },
        { insert: '\n' },
        { insert: { image: 'https://example.com/image.png' } },
        { insert: '\n' },
        { insert: 'You can also include links like this: ' },
        { insert: { link: 'https://example.com', text: 'Example Link' } },
      ]
    },
    isWorkAvailable: true,
    workSolveDeadlineAt: null,
    workCheckDeadlineAt: null,
    workId: 'work-1',
    work: {
      id: 'work-1',
      title: 'Sample Work',
      type: 'mini-test',
      subjectId: 'subject-1',
      description: null,
      createdAt: new Date('2023-01-01T00:00:00Z'),
      updatedAt: new Date('2023-01-01T00:00:00Z'),
    },
    files: [
      {
        id: 'file-1',
        hash: 'file-hash-1',
        order: 1,
        path: '2025/01/01',
        name: 'jsufvh89w8jvodshvsvnd',
        extension: 'pdf',
        actualName: 'Sample File.pdf',
        size: 102400,
        createdAt: new Date('2023-01-01T00:00:00Z'),
        updatedAt: new Date('2023-01-01T00:00:00Z'),
      },
      {
        id: 'file-2',
        hash: 'file-hash-2',
        order: 2,
        path: '2025/01/02',
        name: 'jsufvh89w8jvodshvsvnd',
        extension: 'png',
        actualName: 'Sample File.png',
        size: 102400,
        createdAt: new Date('2023-01-01T00:00:00Z'),
        updatedAt: new Date('2023-01-01T00:00:00Z'),
      },
      {
        id: 'file-3',
        hash: 'file-hash-3',
        order: 3,
        path: '2025/01/03',
        name: 'jsufvh89w8jvodshvsvnd',
        extension: 'jpg',
        actualName: 'Sample File.jpg',
        size: 102400,
        createdAt: new Date('2023-01-01T00:00:00Z'),
        updatedAt: new Date('2023-01-01T00:00:00Z'),
      }
    ],
    createdAt: new Date('2023-01-01T00:00:00Z'),
    updatedAt: new Date('2023-01-01T00:00:00Z'),
  }
}
