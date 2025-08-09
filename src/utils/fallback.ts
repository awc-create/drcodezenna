// src/utils/fallback.ts
import type { BlogPost, TeachingPost } from '@/types';

const FALLBACK_IMG = '/assets/fallback-blog.jpeg';

// 4 fallback blogs
export const FALLBACK_BLOGS: BlogPost[] = [
  {
    id: 'fb-1',
    title: 'Why Media Literacy Still Matters',
    author: 'Dr Odera Ezenna',
    summary: 'Spotting bias, sourcing, and context.',
    image: FALLBACK_IMG,
    content: 'In a world of infinite feeds, literacy means interrogating sources…',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'fb-2',
    title: 'Teaching With Stories',
    author: 'Dr Odera Ezenna',
    summary: 'Narrative as a scaffold for complex topics.',
    image: FALLBACK_IMG,
    content: 'Stories give learners an anchor. Start with lived examples…',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'fb-3',
    title: 'The Newspaper Aesthetic',
    author: 'Dr Odera Ezenna',
    summary: 'Serifs, columns, rhythm.',
    image: FALLBACK_IMG,
    content: 'Design guides attention. Headlines set hierarchy; whitespace breathes…',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'fb-4',
    title: 'Research Routines',
    author: 'Dr Odera Ezenna',
    summary: 'Batch reading, annotation, synthesis.',
    image: FALLBACK_IMG,
    content: 'Block time: skim → deep read → synthesize. Habits win…',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// 4 fallback teaching posts
export const FALLBACK_TEACHING: TeachingPost[] = [
  {
    id: 'ft-1',
    title: 'Media & Society 101',
    school: 'City University',
    year: '2024',
    type: 'Lecture',
    isCurrent: false,
    description: 'Foundations of media theory, bias, and representation.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ft-2',
    title: 'Qualitative Methods Lab',
    school: 'Kingston College',
    year: '2023',
    type: 'Seminar',
    isCurrent: false,
    description: 'Interviews, coding transcripts, thematic maps.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ft-3',
    title: 'Writing for Public Scholarship',
    school: 'Open Learning Institute',
    year: '2022',
    type: 'Workshop',
    isCurrent: false,
    description: 'Turn research into op-eds and accessible essays.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ft-4',
    title: 'Media Histories',
    school: 'Riverside University',
    year: '2021',
    type: 'Lecture',
    isCurrent: false,
    description: 'From print to platform: tech that reshaped discourse.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];
