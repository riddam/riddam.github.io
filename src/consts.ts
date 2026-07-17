export const SITE_TITLE = 'Riddam Jain';
export const SITE_DESCRIPTION =
  'Writing on engineering, books, leadership, and certification study guides.';
export const GITHUB_URL = 'https://github.com/riddam';

export interface Section {
  id: 'engineering' | 'book-notes' | 'leadership' | 'guides';
  label: string;
  description: string;
}

export const SECTIONS: Section[] = [
  {
    id: 'engineering',
    label: 'Engineering',
    description: 'Technical deep dives and implementation write-ups from real projects.',
  },
  {
    id: 'book-notes',
    label: 'Book Notes',
    description: 'Notes and takeaways from books worth remembering.',
  },
  {
    id: 'leadership',
    label: 'Leadership',
    description: 'Thoughts on leading teams, growing engineers, and working well.',
  },
  {
    id: 'guides',
    label: 'Study Guides',
    description: 'In-depth study guides and cheat sheets for certifications and core topics.',
  },
];
