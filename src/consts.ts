export const SITE_TITLE = 'Riddam Jain';
export const SITE_DESCRIPTION =
  'Cloud and application architecture, AI, books, and leadership — field notes from a staff engineer, written to share.';
export const GITHUB_URL = 'https://github.com/riddam';
export const LINKEDIN_URL = 'https://www.linkedin.com/in/riddam/';
export const AUTHOR_ROLE = 'Staff Engineer';
export const AUTHOR_LOCATION = 'Amsterdam';
export const AUTHOR_BLURB =
  "I write about cloud and application architecture, AI, and leading engineers.";

export interface Section {
  id: 'engineering' | 'book-notes' | 'leadership' | 'guides';
  label: string;
  description: string;
}

export interface Series {
  title: string;
  sectionId: Section['id'];
  /** Post slugs in reading order. */
  slugs: string[];
}

export const SERIES: Series[] = [
  {
    title: 'Running stateful cloud infrastructure',
    sectionId: 'engineering',
    slugs: [
      'config-as-data-for-infrastructure-repos',
      'path-filtered-ci-cd-for-infra-monorepos',
      'network-connectivity-for-managed-database-platforms',
      'safe-rollouts-for-stateful-cloud-infrastructure',
    ],
  },
  {
    // Host the platform, then let teams drive it themselves. The infrastructure
    // has to be sound before self-service is safe, so the order matters.
    title: 'Rebuilding a CI/CD platform',
    sectionId: 'engineering',
    slugs: [
      'rebuilding-ci-cd-without-changing-platforms',
      'self-service-with-guardrails',
    ],
  },
  {
    // Design it, build the model, then run it in production. The two exam
    // guides (CCA-F, GCP PCA) sit outside the arc — they're reference prep,
    // not steps, and tag-based "Keep reading" already connects them.
    title: 'Building and running AI systems',
    sectionId: 'guides',
    slugs: [
      'ai-architecture-master-guide',
      'model-training-finetuning-eval',
      'mlops-production-guide',
    ],
  },
  {
    // Where AI runs, as opposed to what it does. The existing AI arc assumes a
    // managed cloud underneath; this one removes that assumption. Post 2 is the
    // centre of gravity -- hybrid and on-prem appear nowhere else on the site.
    // Post 1 is written last: de-duplication against the three AI guides sets
    // its scope, so it can only be sized once 2-4 exist.
    title: 'Running AI beyond one cloud',
    sectionId: 'guides',
    slugs: [
      'portable-ai-platform-contract',
      'connecting-cloud-and-on-premises',
      'document-extraction-at-scale',
      'extraction-data-modelling-with-provenance',
    ],
  },
];

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
