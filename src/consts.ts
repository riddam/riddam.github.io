export const SITE_TITLE = 'Riddam Jain';
export const SITE_DESCRIPTION =
  'Cloud and application architecture, AI, books, and leadership — field notes from a staff engineer, written to share.';
export const GITHUB_URL = 'https://github.com/riddam';
export const LINKEDIN_URL = 'https://www.linkedin.com/in/riddam/';

export interface Section {
  id: 'engineering' | 'book-notes' | 'leadership' | 'guides';
  label: string;
  description: string;
}

export const SECTIONS: Section[] = [
  {
    id: 'engineering',
    label: 'Engineering',
    description:
      'Deep dives and write-ups from real work — cloud and application architecture, and the reasoning behind the decisions.',
  },
  {
    id: 'book-notes',
    label: 'Book Notes',
    description: 'What I took away from books worth remembering, in my own words.',
  },
  {
    id: 'leadership',
    label: 'Leadership',
    description: 'On leading teams, growing engineers, and doing the work well.',
  },
  {
    id: 'guides',
    label: 'Playbooks',
    description:
      "In-depth references and blueprints I've built for certifications, architecture, and core topics — the material I share with the engineers I work with.",
  },
];
